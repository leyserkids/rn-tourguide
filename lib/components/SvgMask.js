import React from 'react';
import { Animated, Dimensions, Easing, View, TouchableWithoutFeedback, useAnimatedValue, } from 'react-native';
import Svg from 'react-native-svg';
import { svgMaskPathMorph } from '../utilities';
import { AnimatedSvgPath } from './AnimatedPath';
export const SvgMask = ({ size = { x: 0, y: 0 }, position = { x: 0, y: 0 }, style, animationDuration, backdropColor, dismissOnPress, maskOffset = 0, borderRadius, currentStep, easing = Easing.linear, stop, }) => {
    const rafID = React.useRef();
    const windowDimensions = Dimensions.get('window');
    const [canvasSize, setCanvasSize] = React.useState({
        x: windowDimensions.width,
        y: windowDimensions.height,
    });
    const firstPath = React.useMemo(() => `M0,0H${windowDimensions.width}V${windowDimensions.height}H0V0ZM${windowDimensions.width / 2},${windowDimensions.height / 2} h 1 v 1 h -1 Z`, [windowDimensions.width, windowDimensions.height]);
    const previousPathRef = React.useRef(firstPath);
    const opacity = useAnimatedValue(0);
    const [path, setPath] = React.useState('');
    const pathRef = React.useRef(path);
    const pathAnimation = useAnimatedValue(0);
    React.useEffect(() => {
        pathRef.current = path;
    }, [path]);
    const getPath = React.useCallback(() => {
        const d = svgMaskPathMorph({
            animation: pathAnimation,
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
        pathAnimation,
        position,
        size,
        currentStep === null || currentStep === void 0 ? void 0 : currentStep.shape,
        currentStep === null || currentStep === void 0 ? void 0 : currentStep.maskOffset,
        currentStep === null || currentStep === void 0 ? void 0 : currentStep.borderRadius,
        currentStep === null || currentStep === void 0 ? void 0 : currentStep.borderRadiusObject,
        maskOffset,
        borderRadius,
    ]);
    const animationListener = React.useCallback(() => {
        const d = getPath();
        rafID.current = requestAnimationFrame(() => {
            setPath(d);
        });
    }, [getPath]);
    const animate = React.useCallback(() => {
        const animations = [
            Animated.timing(pathAnimation, {
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
                previousPathRef.current = path;
                if (pathAnimation._value === 1) {
                    pathAnimation.setValue(0);
                }
            }
        });
    }, [animationDuration, easing, opacity, path, pathAnimation]);
    React.useEffect(() => {
        const listenerID = pathAnimation.addListener(animationListener);
        return () => {
            pathAnimation.removeListener(listenerID);
            if (rafID.current) {
                cancelAnimationFrame(rafID.current);
            }
        };
    }, [animationListener, pathAnimation]);
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
            React.createElement(AnimatedSvgPath, { fill: backdropColor, strokeWidth: 0, fillRule: "evenodd", d: path, opacity: opacity }))));
};
