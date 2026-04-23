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

// Lazy loader — defers native JSI initialization until first use
async function getOrt(): Promise<typeof OrtType> {
    const ort = require('onnxruntime-react-native');
    if (!ort?.InferenceSession) {
        throw new Error(
            'ONNX Runtime native module is not available. ' +
            'Install the dev build APK from the EAS dashboard and connect via "npm run start:dev". ' +
            'Expo Go does not support native modules.'
        );
    }
    return ort;
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
    const info = await FileSystem.getInfoAsync(targetPath, { size: true });
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

export async function classifyingImage(uri: string): Promise<number> {
    const ort = await getOrt();
    const sess = await loadModel();

    const manipulated = await manipulateAsync(
        uri,
        [{ resize: { width: 224, height: 224 } }],
        { base64: true }
    );

    const base64 = manipulated.base64!;
    const jpegBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const { data: raw } = jpeg.decode(jpegBytes.buffer as ArrayBuffer, { useTArray: true });

    const tensor = preprocess(raw, ort);
    const feeds: Record<string, OrtType.Tensor> = { input: tensor };

    try {
        const results = await sess.run(feeds);
        const output = results.output.data as Float32Array;
        let maxIdx = 0;
        for (let i = 1; i < output.length; i++) {
            if (output[i] > output[maxIdx]) maxIdx = i;
        }
        return maxIdx;
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
