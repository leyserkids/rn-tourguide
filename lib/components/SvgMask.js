import React from 'react';
import { Animated, Easing, View, TouchableWithoutFeedback, useAnimatedValue, useWindowDimensions, } from 'react-native';
import Svg, { Path as SvgPath } from 'react-native-svg';
import { svgMaskPathMorph } from '../utilities';
export const SvgMask = ({ size = { x: 0, y: 0 }, position = { x: 0, y: 0 }, style, animationDuration, backdropColor, dismissOnPress, maskOffset = 0, borderRadius, currentStep, easing = Easing.linear, stop, }) => {
    const requestNextID = React.useRef();
    const windowDimensions = useWindowDimensions();
    const firstPath = React.useMemo(() => `M0,0H${windowDimensions.width}V${windowDimensions.height}H0V0ZM${windowDimensions.width / 2},${windowDimensions.height / 2} h 1 v 1 h -1 Z`, [windowDimensions.width, windowDimensions.height]);
    const previousPathRef = React.useRef(firstPath);
    const [path, setPath] = React.useState(firstPath);
    const pathRef = React.useRef(firstPath);
    const opacity = useAnimatedValue(0);
    const opacityRef = React.useRef(0);
    const animation = useAnimatedValue(0);
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
        requestNextID.current = requestAnimationFrame(() => {
            pathRef.current = d;
            setPath(d);
        });
    }, [getPath]);
    const animate = React.useCallback(() => {
        animation.setValue(0);
        const animations = [
            Animated.timing(animation, {
                toValue: 1,
                duration: animationDuration,
                easing,
                useNativeDriver: false,
            }),
        ];
        if (opacityRef.current !== 1) {
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
            }
        });
    }, [animationDuration, easing, opacity, animation]);
    const opacityListener = React.useCallback((state) => {
        opacityRef.current = state.value;
    }, []);
    React.useEffect(() => {
        const listenerID1 = opacity.addListener(opacityListener);
        const listenerID2 = animation.addListener(animationListener);
        return () => {
            opacity.removeListener(listenerID1);
            animation.removeListener(listenerID2);
            if (requestNextID.current) {
                cancelAnimationFrame(requestNextID.current);
            }
        };
    }, [animationListener, animation, opacityListener, opacity]);
    React.useEffect(() => {
        animate();
    }, [position, size, animate]);
    const Wrapper = dismissOnPress ? TouchableWithoutFeedback : View;
    return (React.createElement(Wrapper, { style: style, onPress: dismissOnPress ? stop : undefined },
        React.createElement(Svg, { pointerEvents: "none", width: '100%', height: '100%' },
            React.createElement(SvgPath, { ref: svgPathRef, fill: backdropColor, strokeWidth: 0, fillRule: "evenodd", d: path, opacity: opacity }))));
};
