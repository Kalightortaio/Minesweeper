import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';
import { boardHeight, boardWidth } from '../Constants';

interface ZoomableProps {
    children: ReactNode,
    style?: StyleProp<ViewStyle>,
    setPanOrPinchActive: (isActive: boolean) => void,
}

function Zoomable({ children, style, setPanOrPinchActive }: ZoomableProps) {
    const currentScale = useSharedValue(1);
    const previousScale = useSharedValue(1);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const focalX = useSharedValue(0);
    const focalY = useSharedValue(0);
    const panX = useSharedValue(0);
    const panY = useSharedValue(0);
    const maxScale = 3;
    const minScale = 1;

    const pinchGesture = Gesture.Pinch()
        .onStart((event) => {
            focalX.value = event.focalX;
            focalY.value = event.focalY;
            previousScale.value = currentScale.value;
            runOnJS(setPanOrPinchActive)(true);
        })
        .onUpdate((event) => {
            let newScale = event.scale * previousScale.value;
            newScale = Math.min(Math.max(newScale, minScale), maxScale);

            const adjustX = event.focalX - focalX.value;
            const adjustY = event.focalY - focalY.value;
            if (newScale !== currentScale.value) {
                const maxOffsetX = Math.max((boardWidth * (newScale - 1)) / 2, 0);
                const maxOffsetY = Math.max((boardHeight * (newScale - 1)) / 2, 0);

                offsetX.value = Math.min(Math.max(offsetX.value + adjustX / currentScale.value, -maxOffsetX), maxOffsetX);
                offsetY.value = Math.min(Math.max(offsetY.value + adjustY / currentScale.value, -maxOffsetY), maxOffsetY);

                currentScale.value = newScale;
            }
        })
        .onEnd(() => {
            focalX.value = 0;
            focalY.value = 0;
            runOnJS(setPanOrPinchActive)(false);
        });

    const panGesture = Gesture.Pan()
        .minPointers(1)
        .maxPointers(1)
        .onStart(() => {
            panX.value = offsetX.value;
            panY.value = offsetY.value;
            runOnJS(setPanOrPinchActive)(true);
        })
        .onUpdate((event) => {
            if (currentScale.value !== minScale) {
                const normalizedZoom = (currentScale.value - minScale) / (maxScale - minScale);

                const minPanningSpeed = 0.8;
                const maxPanningSpeed = 1.0;
                const dynamicScalingFactor = minPanningSpeed + (maxPanningSpeed - minPanningSpeed) * normalizedZoom;

                const scaledTranslationX = event.translationX * dynamicScalingFactor;
                const scaledTranslationY = event.translationY * dynamicScalingFactor;

                const newOffsetX = panX.value + scaledTranslationX;
                const newOffsetY = panY.value + scaledTranslationY;

                const maxOffsetX = (boardWidth * (currentScale.value - 1)) / 2;
                const maxOffsetY = (boardHeight * (currentScale.value - 1)) / 2;

                offsetX.value = Math.min(Math.max(newOffsetX, -maxOffsetX), maxOffsetX);
                offsetY.value = Math.min(Math.max(newOffsetY, -maxOffsetY), maxOffsetY);
            }
        })
        .onEnd(() => {
            runOnJS(setPanOrPinchActive)(false);
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: offsetX.value },
                { translateY: offsetY.value },
                { scale: currentScale.value }
            ],
        };
    });

    return (
        <View style={style}>
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
                <Animated.View style={animatedStyle}>
                    {children}
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

export default Zoomable;