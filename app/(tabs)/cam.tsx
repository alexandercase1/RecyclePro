import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { ActivityIndicator, Button, Pressable, StyleSheet, Text, View } from 'react-native';
import { CLASS_LABELS, classifyingImage } from '../../services/model';

export default function Cam() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const ref = useRef<CameraView>(null);
    const [uri, setUri] = useState<string | null>(null);
    const [label, setLabel] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Permissions needed to use the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    const takePicture = async () => {
        setError(null);
        setLabel(null);
        setLoading(true);
        try {
            const photo = await ref.current?.takePictureAsync();
            if (photo?.uri) {
                setUri(photo.uri);
                const idx = await classifyingImage(photo.uri);
                const name = CLASS_LABELS[idx] ?? `Unknown (${idx})`;
                setLabel(name);
                console.log('Predicted class:', idx, name);
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error('Classification error:', msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const toggleFacing = () => {
        setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
    };

    const renderPicture = (uri: string) => {
        return (
            <View style={styles.resultContainer}>
                <Image
                    source={{ uri }}
                    contentFit="contain"
                    style={styles.resultImage}
                />
                {loading && <ActivityIndicator size="large" style={styles.spinner} />}
                {label && (
                    <View style={styles.labelBox}>
                        <Text style={styles.labelText}>{label}</Text>
                    </View>
                )}
                <Button onPress={() => { setUri(null); setLabel(null); }} title="Take another picture" />
            </View>
        );
    };

    const renderCamera = () => {
        const CameraViewAny = CameraView as any;
        return (
            <View style={styles.cameraContainer}>
                <CameraViewAny
                    style={styles.camera}
                    ref={ref}
                    facing={facing}
                    mute={false}
                    responsiveOrientationWhenOrientationLocked
                />
                <View style={styles.shutterContainer}>
                    <Pressable onPress={takePicture} disabled={loading}>
                        {({ pressed }: { pressed: boolean }) => (
                            <View style={[styles.shutterBtn, { opacity: pressed || loading ? 0.5 : 1 }]}>
                                <View style={[styles.shutterBtnInner, { backgroundColor: 'white' }]} />
                            </View>
                        )}
                    </Pressable>
                    <Pressable onPress={toggleFacing}>
                        <FontAwesome6 name="rotate-left" size={32} color="white" />
                    </Pressable>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {uri ? renderPicture(uri) : renderCamera()}
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraContainer: StyleSheet.absoluteFillObject,
    camera: StyleSheet.absoluteFillObject,
    shutterContainer: {
        position: 'absolute',
        bottom: 44,
        left: 0,
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
    },
    shutterBtn: {
        backgroundColor: 'transparent',
        borderWidth: 5,
        borderColor: 'white',
        width: 85,
        height: 85,
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shutterBtnInner: {
        width: 70,
        height: 70,
        borderRadius: 50,
    },
    resultContainer: {
        alignItems: 'center',
        gap: 12,
    },
    resultImage: {
        width: 300,
        aspectRatio: 1,
    },
    spinner: {
        marginVertical: 8,
    },
    labelBox: {
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    labelText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    error: {
        position: 'absolute',
        bottom: 140,
        left: 16,
        right: 16,
        color: 'red',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        borderRadius: 6,
    },
});
