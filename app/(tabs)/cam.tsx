import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Cam() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const ref = useRef<CameraView>(null);
    const [uri, setUri] = useState<string | null>(null);

    if (!permission) {
        // no perms yet
        return <View/>;
    }

    if (!permission.granted) {
        // perms denied
        return(
            <View style = {styles.container}>
                <Text style = {styles.message}>Grant Permission to Access Camera</Text>
                <Button onPress = {requestPermission} title = "Set Permissions" />
            </View>
        );
    }
    
    const takePicture = async () => {
        const phtot = await ref.current?.takePictureAsync();
        if(phtot?.uri) setUri(phtot.uri);
    }

    const toggleFacing = () => {
        setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
    }

    const renderPicture = (uri: string) => {
        return (
            <View>
                <Image
                    source = {{uri}}
                    contentFit = 'contain'
                    style = {{ width: 300, aspectRatio: 1}}
                />
                <Button onPress = {() => setUri(null)} title = 'Take another picture'/>
            </View>
        )
    }

    const renderCamera = () => {
        return (
            <View style = {styles.cameraContainer}>
                <CameraView
                    style = {styles.camera}
                    ref = {ref}
                    facing = {facing}
                    mute = {false}
                    responsiveOrientationWhenOrientationLocked
                />
                <View style = {styles.shutterContainer}>
                    <Pressable onPress={takePicture}>
                    {({ pressed }) => (
                        <View
                            style = {[
                                styles.shutterBtn,
                                {
                                    opacity: pressed ? 0.5 : 1,
                                },
                            ]}
                            >
                                <View
                                    style = {[
                                        styles.shutterBtnInner,
                                        {
                                            backgroundColor: 'white',
                                        },
                                    ]}
                                />
                            </View>
                        )}
                    </Pressable>
                    <Pressable onPress = {toggleFacing}>
                        <FontAwesome6 name = 'rotate-left' size = {32} color = 'white' />
                    </Pressable>
                </View>
            </View>
        );
    };

    return (
        <View style = {styles.container}>
            {uri ? renderPicture(uri) : renderCamera()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
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
        borderRadius: 50
    },

    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
});