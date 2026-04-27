import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync } from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import type * as OrtType from 'onnxruntime-react-native';
import { Platform } from 'react-native';

export const CLASS_LABELS = [
    'Cardboard',
    'Electronics',
    'Glass',
    'Hazardous',
    'Metal',
    'Non-Recyclable',
    'Paper',
    'Plastic',
];

let session: OrtType.InferenceSession | null = null;
const ORT_UNAVAILABLE_MESSAGE =
    'ONNX Runtime native module is not available. ' +
    'Install the dev build APK from the EAS dashboard and connect via "npm run start:dev". ' +
    'Expo Go does not support native modules.';

// Lazy loader — defers native JSI initialization until first use
async function getOrt(): Promise<typeof OrtType> {
    try {
        const ort = require('onnxruntime-react-native');
        if (!ort?.InferenceSession) {
            throw new Error(ORT_UNAVAILABLE_MESSAGE);
        }
        return ort;
    } catch (e) {
        // In Expo Go, requiring the native module throws during initialization.
        // Convert that hard crash into a controlled error that UI code can show.
        const msg = e instanceof Error ? e.message : String(e);
        if (
            msg.includes('Cannot read property') ||
            msg.includes('native module') ||
            msg.includes('onnxruntime-react-native')
        ) {
            throw new Error(ORT_UNAVAILABLE_MESSAGE);
        }
        throw e;
    }
}

const MODEL_DIR = FileSystem.cacheDirectory + 'onnx_model/';
const MODEL_PATH = MODEL_DIR + 'recycle_classify.onnx';
const DATA_PATH = MODEL_DIR + 'recycle_classify.onnx.data';

// Minimum expected byte sizes — anything smaller is a corrupt/partial download
const MIN_SIZES: Record<string, number> = {
    [MODEL_PATH]: 300_000,    // .onnx is ~336 KB
    [DATA_PATH]:  16_842_000, // .onnx.data is exactly 16,842,752 bytes
};

async function ensureFile(asset: Asset, targetPath: string, androidAssetName: string) {
    const info = await FileSystem.getInfoAsync(targetPath);
    const size = (info as any).size ?? 0;
    if (info.exists && size >= MIN_SIZES[targetPath]) return;

    // File missing or too small — wipe it and re-copy
    if (info.exists) await FileSystem.deleteAsync(targetPath, { idempotent: true });

    if (Platform.OS === 'android') {
        // Copy from native Android assets (bundled in APK) — bypasses Metro,
        // which was truncating the 17 MB .onnx.data file by ~1 KB.
        await FileSystem.copyAsync({
            from: `asset:///models/${androidAssetName}`,
            to: targetPath,
        });
    } else {
        await FileSystem.downloadAsync(asset.uri, targetPath, {
            headers: { 'Accept-Encoding': 'identity' },
        });
    }
}

export async function loadModel(): Promise<OrtType.InferenceSession> {
    if (session) return session;

    const ort = await getOrt();

    try {
        await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });

        await ensureFile(
            Asset.fromModule(require('../assets/models/recycle_classify.onnx')),
            MODEL_PATH,
            'recycle_classify.onnx'
        );
        await ensureFile(
            Asset.fromModule(require('../assets/models/recycle_classify.onnxdata')),
            DATA_PATH,
            'recycle_classify.onnx.data'
        );

        session = await ort.InferenceSession.create(MODEL_PATH);
        return session;
    } catch (e) {
        session = null; // allow retry on next call
        const msg = e instanceof Error ? e.message : String(e);
        throw new Error(`ONNX model failed to load: ${msg}`);
    }
}

function softmax(raw: Float32Array): Float32Array {
    const max = Math.max(...Array.from(raw));
    const exps = raw.map(x => Math.exp(x - max));
    const sum = Array.from(exps).reduce((a, b) => a + b, 0);
    return exps.map(x => x / sum);
}

export async function classifyingImage(uri: string): Promise<{ index: number; confidence: number }> {
    const ort = await getOrt();
    const sess = await loadModel();

    // Resize so the shorter side is 256px (maintains aspect ratio),
    // then center-crop to 224×224 — matches standard ImageNet preprocessing
    // and avoids the shape distortion of squishing directly to 224×224.
    let resized = await manipulateAsync(uri, [{ resize: { width: 256 } }], {});
    if (resized.height < 224) {
        // Landscape photo — resize by height instead so the crop fits
        resized = await manipulateAsync(uri, [{ resize: { height: 256 } }], {});
    }
    const cropX = Math.floor((resized.width - 224) / 2);
    const cropY = Math.floor((resized.height - 224) / 2);
    const manipulated = await manipulateAsync(
        resized.uri,
        [{ crop: { originX: Math.max(0, cropX), originY: Math.max(0, cropY), width: 224, height: 224 } }],
        { base64: true }
    );

    const base64 = manipulated.base64!;
    const jpegBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const { data: raw } = jpeg.decode(jpegBytes.buffer as ArrayBuffer, { useTArray: true });

    const tensor = preprocess(raw, ort);
    const feeds: Record<string, OrtType.Tensor> = { input: tensor };

    try {
        const results = await sess.run(feeds);
        const logits = results.output.data as Float32Array;
        const probs = softmax(logits);

        let maxIdx = 0;
        for (let i = 1; i < probs.length; i++) {
            if (probs[i] > probs[maxIdx]) maxIdx = i;
        }
        return { index: maxIdx, confidence: probs[maxIdx] };
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new Error(`ONNX inference failed: ${msg}`);
    }
}

function preprocess(raw: Uint8Array, ort: typeof OrtType): OrtType.Tensor {
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];

    const pixels = new Float32Array(3 * 224 * 224);

    for (let i = 0; i < 224 * 224; i++) {
        const r = raw[i * 4] / 255;
        const g = raw[i * 4 + 1] / 255;
        const b = raw[i * 4 + 2] / 255;

        pixels[i] = (r - mean[0]) / std[0];
        pixels[i + 224 * 224] = (g - mean[1]) / std[1];
        pixels[i + 2 * 224 * 224] = (b - mean[2]) / std[2];
    }

    return new ort.Tensor('float32', pixels, [1, 3, 224, 224]);
}
