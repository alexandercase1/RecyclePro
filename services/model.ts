import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync } from 'expo-image-manipulator';
import type * as OrtType from 'onnxruntime-react-native';

export const CLASS_LABELS = [
    'Cardboard',
    'Electronics',
    'Glass',
    'Metal',
    'Non-Recyclable',
    'Paper',
    'Plastic',
];

let session: OrtType.InferenceSession | null = null;

// Lazy loader — defers native JSI initialization until first use
async function getOrt(): Promise<typeof OrtType> {
    return require('onnxruntime-react-native');
}

const MODEL_DIR = FileSystem.cacheDirectory + 'onnx_model/';
const MODEL_PATH = MODEL_DIR + 'rec_class_1.onnx';
const DATA_PATH = MODEL_DIR + 'rec_class_1.onnx.data';

async function ensureFile(asset: Asset, targetPath: string) {
    const info = await FileSystem.getInfoAsync(targetPath);
    if (!info.exists) {
        await asset.downloadAsync();
        await FileSystem.copyAsync({ from: asset.localUri!, to: targetPath });
    }
}

export async function loadModel(): Promise<OrtType.InferenceSession> {
    if (session) return session;

    const ort = await getOrt();

    try {
        await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });

        await ensureFile(
            Asset.fromModule(require('../assets/models/rec_class_1.onnx')),
            MODEL_PATH
        );
        await ensureFile(
            Asset.fromModule(require('../assets/models/rec_class_1.onnx.data')),
            DATA_PATH
        );

        // Delete stale cached files so a bad prior copy doesn't persist
        const stale = [MODEL_DIR + 'rec_class.onnx', MODEL_DIR + 'rec_class.onnx.data'];
        for (const p of stale) {
            const info = await FileSystem.getInfoAsync(p);
            if (info.exists) await FileSystem.deleteAsync(p, { idempotent: true });
        }

        session = await ort.InferenceSession.create(MODEL_PATH);
        return session;
    } catch (e) {
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
    const raw = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

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
