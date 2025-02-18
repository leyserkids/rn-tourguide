import React from 'react';
import { Animated, Dimensions, Easing, View, TouchableWithoutFeedback, useAnimatedValue, } from 'react-native';
import Svg, { Path as SvgPath } from 'react-native-svg';
import { svgMaskPathMorph } from '../utilities';
export const SvgMask = ({ size = { x: 0, y: 0 }, position = { x: 0, y: 0 }, style, animationDuration, backdropColor, dismissOnPress, maskOffset = 0, borderRadius, currentStep, easing = Easing.linear, stop, }) => {
    const rafID = React.useRef();
    const windowDimensions = Dimensions.get('window');
    const [canvasSize, setCanvasSize] = React.useState({
        x: windowDimensions.width,
        y: windowDimensions.height,
    });
    const firstPath = React.useMemo(() => `M0,0H${windowDimensions.width}V${windowDimensions.height}H0V0ZM${windowDimensions.width / 2},${windowDimensions.height / 2} h 1 v 1 h -1 Z`, [windowDimensions.width, windowDimensions.height]);
    const previousPathRef = React.useRef(firstPath);
    const pathRef = React.useRef(firstPath);
    const opacity = useAnimatedValue(0);
    const animation = useAnimatedValue(0);
    const currentAnimationRef = React.useRef(0);
    const svgPathRef = React.useRef(null);
    const getPath = React.useCallback((v) => {
        const d = svgMaskPathMorph({
            animation: v,
            previousPath: previousPathRef.current,
            to: {
                position,
                size,
                shape: currentStep === null || currentStep === void 0 ? void 0 : currentStep.shape,
                maskOffset: (currentStep === null || currentStep === void 0 ? void 0 : currentStep.maskOffset) || maskOffset,
                borderRadius: (currentStep === null || currentStep === void 0 ? void 0 : currentStep.borderRadius) || borderRadius,
                borderRadiusObject: currentStep === null || currentStep === void 0 ? void 0 : currentStep.borderRadiusObject,
            },
        });
        return d;
    }, [
        position,
        size,
        currentStep === null || currentStep === void 0 ? void 0 : currentStep.shape,
        currentStep === null || currentStep === void 0 ? void 0 : currentStep.maskOffset,
        currentStep === null || currentStep === void 0 ? void 0 : currentStep.borderRadius,
        currentStep === null || currentStep === void 0 ? void 0 : currentStep.borderRadiusObject,
        maskOffset,
        borderRadius,
    ]);
    const animationListener = React.useCallback((state) => {
        const d = getPath(state.value);
        rafID.current = requestAnimationFrame(() => {
            var _a;
            (_a = svgPathRef.current) === null || _a === void 0 ? void 0 : _a.setNativeProps({ d });
            pathRef.current = d;
            currentAnimationRef.current = state.value;
        });
    }, [getPath]);
    const animate = React.useCallback(() => {
        const animations = [
            Animated.timing(animation, {
                toValue: 1,
                duration: animationDuration,
                easing,
                useNativeDriver: false,
            }),
        ];
        if (opacity._value !== 1) {
            animations.push(Animated.timing(opacity, {
                toValue: 1,
                duration: animationDuration,
                easing,
                useNativeDriver: true,
            }));
        }
        Animated.parallel(animations, { stopTogether: false }).start((result) => {
            if (result.finished) {
                previousPathRef.current = pathRef.current;
                animation.setValue(0);
            }
        });
    }, [animationDuration, easing, opacity, animation]);
    React.useEffect(() => {
        const listenerID = animation.addListener(animationListener);
        return () => {
            animation.removeListener(listenerID);
            if (rafID.current) {
                cancelAnimationFrame(rafID.current);
            }
        };
    }, [animationListener, animation]);
    React.useEffect(() => {
        animate();
    }, [position, size, animate]);
    const handleLayout = (e) => {
        setCanvasSize({
            x: e.nativeEvent.layout.width,
            y: e.nativeEvent.layout.height,
        });
    };
    const Wrapper = dismissOnPress ? TouchableWithoutFeedback : View;
    return (React.createElement(Wrapper, { style: style, onLayout: handleLayout, onPress: dismissOnPress ? stop : undefined },
        React.createElement(Svg, { pointerEvents: "none", width: canvasSize.x, height: canvasSize.y },
            React.createElement(SvgPath, { ref: svgPathRef, fill: backdropColor, strokeWidth: 0, fillRule: "evenodd", d: firstPath, opacity: opacity }))));
};
