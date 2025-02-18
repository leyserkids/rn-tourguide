import React from 'react';
import { Animated, Dimensions, Easing, Platform, View, TouchableWithoutFeedback, } from 'react-native';
import Svg from 'react-native-svg';
import { svgMaskPathMorph } from '../utilities';
import { AnimatedSvgPath } from './AnimatedPath';
const IS_WEB = Platform.OS !== 'web';
export const SvgMask = ({ size = { x: 0, y: 0 }, position = { x: 0, y: 0 }, style, animationDuration, backdropColor, dismissOnPress, maskOffset = 0, borderRadius, currentStep, easing = Easing.linear, stop, }) => {
    const windowDimensions = Dimensions.get('window');
    const mask = React.useRef(null);
    const rafID = React.useRef();
    const firstPath = `M0,0H${windowDimensions.width}V${windowDimensions.height}H0V0ZM${windowDimensions.width / 2},${windowDimensions.height / 2} h 1 v 1 h -1 Z`;
    const [state, setState] = React.useState({
        canvasSize: {
            x: windowDimensions.width,
            y: windowDimensions.height,
        },
        opacity: new Animated.Value(0),
        animation: new Animated.Value(0),
        previousPath: firstPath,
    });
    const getPath = React.useCallback(() => {
        return svgMaskPathMorph({
            animation: state.animation,
            previousPath: state.previousPath,
            to: {
                position,
                size,
                shape: currentStep === null || currentStep === void 0 ? void 0 : currentStep.shape,
                maskOffset: (currentStep === null || currentStep === void 0 ? void 0 : currentStep.maskOffset) || maskOffset,
                borderRadius: (currentStep === null || currentStep === void 0 ? void 0 : currentStep.borderRadius) || borderRadius,
                borderRadiusObject: currentStep === null || currentStep === void 0 ? void 0 : currentStep.borderRadiusObject,
            },
        });
    }, [
        state.animation,
        state.previousPath,
        position,
        size,
        currentStep,
        maskOffset,
        borderRadius,
    ]);
    const animationListener = React.useCallback(() => {
        const d = getPath();
        rafID.current = requestAnimationFrame(() => {
            if (mask.current) {
                if (IS_WEB) {
                    mask.current.setNativeProps({ d });
                }
                else {
                    mask.current._touchableNode.setAttribute('d', d);
                }
            }
        });
    }, [getPath]);
    const animate = React.useCallback(() => {
        const animations = [
            Animated.timing(state.animation, {
                toValue: 1,
                duration: animationDuration,
                easing,
                useNativeDriver: false,
            }),
        ];
        if (state.opacity._value !== 1) {
            animations.push(Animated.timing(state.opacity, {
                toValue: 1,
                duration: animationDuration,
                easing,
                useNativeDriver: true,
            }));
        }
        Animated.parallel(animations, { stopTogether: false }).start((result) => {
            if (result.finished) {
                setState((prev) => ({ ...prev, previousPath: getPath() }));
                if (state.animation._value === 1) {
                    state.animation.setValue(0);
                }
            }
        });
    }, [state.animation, state.opacity, animationDuration, easing, getPath]);
    React.useEffect(() => {
        const listenerID = state.animation.addListener(animationListener);
        return () => {
            state.animation.removeListener(listenerID);
            if (rafID.current) {
                cancelAnimationFrame(rafID.current);
            }
        };
    }, [state.animation, animationListener]);
    React.useEffect(() => {
        animate();
    }, [position, size, animate]);
    const handleLayout = ({ nativeEvent: { layout: { width, height }, }, }) => {
        setState((prev) => ({
            ...prev,
            canvasSize: {
                x: width,
                y: height,
            },
        }));
    };
    if (!state.canvasSize) {
        return null;
    }
    const Wrapper = dismissOnPress ? TouchableWithoutFeedback : View;
    return (React.createElement(Wrapper, { style: style, onLayout: handleLayout, onPress: dismissOnPress ? stop : undefined },
        React.createElement(Svg, { pointerEvents: "none", width: state.canvasSize.x, height: state.canvasSize.y },
            React.createElement(AnimatedSvgPath, { ref: mask, fill: backdropColor, strokeWidth: 0, fillRule: "evenodd", d: firstPath, opacity: state.opacity }))));
};
