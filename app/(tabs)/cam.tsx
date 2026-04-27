import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Button,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { ItemCard } from '@/components/recyclability/ItemCard';
import { RecyclingSearchResult, MaterialCategory } from '@/data/types';
import { getItemsByCategoryWithDisposal } from '@/services/searchService';
import { getSavedLocation, SavedLocation } from '@/services/storageService';
import { CLASS_LABELS, classifyingImage, loadModel } from '../../services/model';

const CONFIDENCE_THRESHOLD = 0.45;

const LABEL_TO_CATEGORY: Record<string, { category: MaterialCategory | null; emoji: string }> = {
    'Cardboard':      { category: 'paper_cardboard', emoji: '📦' },
    'Electronics':    { category: 'electronics',     emoji: '📱' },
    'Glass':          { category: 'glass',            emoji: '🫙' },
    'Hazardous':      { category: 'hazardous',        emoji: '☣️' },
    'Metal':          { category: 'metal',            emoji: '🥫' },
    'Non-Recyclable': { category: null,               emoji: '🗑️' },
    'Paper':          { category: 'paper_cardboard',  emoji: '📄' },
    'Plastic':        { category: 'plastic',          emoji: '🧴' },
};

export default function Cam() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const ref = useRef<CameraView>(null);
    const [uri, setUri] = useState<string | null>(null);
    const [label, setLabel] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<SavedLocation | null>(null);
    const [categoryItems, setCategoryItems] = useState<RecyclingSearchResult[]>([]);
    const [sheetVisible, setSheetVisible] = useState(false);
    const [confidence, setConfidence] = useState(0);
    const sheetAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        getSavedLocation().then(setLocation);
        loadModel().catch(() => {});
    }, []);

    useFocusEffect(
        useCallback(() => {
            return () => {
                setUri(null);
                setLabel(null);
                setCategoryItems([]);
                setSheetVisible(false);
                setConfidence(0);
                sheetAnim.setValue(0);
            };
        }, [sheetAnim])
    );

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

    const openSheet = () => {
        setSheetVisible(true);
        Animated.spring(sheetAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    const closeSheet = () => {
        Animated.timing(sheetAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
            setSheetVisible(false);
        });
    };

    const takePicture = async () => {
        setError(null);
        setLabel(null);
        setLoading(true);
        try {
            const photo = await ref.current?.takePictureAsync();
            if (photo?.uri) {
                setUri(photo.uri);
                const { index: idx, confidence: conf } = await classifyingImage(photo.uri);
                const name = CLASS_LABELS[idx] ?? `Unknown (${idx})`;
                setLabel(name);
                setConfidence(conf);

                const meta = LABEL_TO_CATEGORY[name];
                const items = conf >= CONFIDENCE_THRESHOLD && meta?.category
                    ? getItemsByCategoryWithDisposal(meta.category, location)
                    : [];
                setCategoryItems(items);
                openSheet();
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error('Classification error:', msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const resetCamera = () => {
        closeSheet();
        setUri(null);
        setLabel(null);
        setCategoryItems([]);
        setConfidence(0);
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
                <View style={styles.framingOverlay} pointerEvents="none">
                    <View style={styles.framingBox} />
                    <Text style={styles.framingHint}>Center item · fill the frame</Text>
                </View>
                <View style={styles.shutterContainer}>
                    <View style={styles.shutterSide} />
                    <Pressable onPress={takePicture} disabled={loading}>
                        {({ pressed }: { pressed: boolean }) => (
                            <View style={[styles.shutterBtn, { opacity: pressed || loading ? 0.5 : 1 }]}>
                                <View style={[styles.shutterBtnInner, { backgroundColor: 'white' }]} />
                            </View>
                        )}
                    </Pressable>
                    <View style={styles.shutterSide}>
                        <Pressable onPress={toggleFacing}>
                            <FontAwesome6 name="rotate-left" size={32} color="white" />
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {uri ? renderPicture(uri) : renderCamera()}
            {error && <Text style={styles.error}>{error}</Text>}

            {sheetVisible && label && (
                <>
                    <Pressable style={styles.backdrop} onPress={resetCamera} />
                    <Animated.View style={[
                        styles.sheet,
                        {
                            transform: [{
                                translateY: sheetAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [600, 0],
                                }),
                            }],
                        },
                    ]}>
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>
                                {confidence >= CONFIDENCE_THRESHOLD
                                    ? `${LABEL_TO_CATEGORY[label]?.emoji} ${label}`
                                    : '🤔 Couldn\'t Identify'}
                            </Text>
                            <Pressable onPress={resetCamera} hitSlop={12}>
                                <Text style={styles.sheetClose}>✕</Text>
                            </Pressable>
                        </View>

                        <ScrollView contentContainerStyle={styles.sheetScroll}>
                            {confidence < CONFIDENCE_THRESHOLD ? (
                                <Text style={styles.sheetLowConfidence}>
                                    The image wasn't clear enough to identify. Try getting closer, improving lighting, or centering the item in the frame.
                                </Text>
                            ) : categoryItems.length > 0
                                ? categoryItems.map(result => (
                                    <ItemCard key={result.item.id} result={result} />
                                ))
                                : (
                                    <Text style={styles.sheetEmpty}>
                                        No specific items found — check your local waste guidelines.
                                    </Text>
                                )
                            }
                        </ScrollView>

                        <Pressable style={styles.retakeBtn} onPress={resetCamera}>
                            <Text style={styles.retakeBtnText}>Take another picture</Text>
                        </Pressable>
                    </Animated.View>
                </>
            )}
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
    shutterSide: {
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
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
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '70%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 10,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ddd',
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    sheetClose: {
        fontSize: 20,
        color: '#888',
        padding: 4,
    },
    sheetScroll: {
        padding: 16,
        paddingBottom: 8,
    },
    sheetEmpty: {
        textAlign: 'center',
        color: '#888',
        marginTop: 24,
        fontSize: 14,
    },
    framingOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 60,
    },
    framingBox: {
        width: 260,
        height: 260,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.75)',
        borderRadius: 16,
    },
    framingHint: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 12,
        marginTop: 10,
        letterSpacing: 0.3,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    sheetLowConfidence: {
        textAlign: 'center',
        color: '#555',
        marginTop: 24,
        marginHorizontal: 8,
        fontSize: 15,
        lineHeight: 22,
    },
    retakeBtn: {
        margin: 16,
        paddingVertical: 14,
        backgroundColor: '#2E8B57',
        borderRadius: 12,
        alignItems: 'center',
    },
    retakeBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
