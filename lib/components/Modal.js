import * as React from 'react';
import { Animated, Easing, Platform, StatusBar, StyleSheet, View, Modal as RNModal, } from 'react-native';
import styles, { MARGIN } from './style';
import { SvgMask } from './SvgMask';
import { Tooltip } from './Tooltip';
export const Modal = React.forwardRef((props, ref) => {
    const { visible, currentStep, animationDuration = 400, tooltipComponent: TooltipComponent = Tooltip, tooltipStyle = {}, androidStatusBarVisible = false, backdropColor = 'rgba(0, 0, 0, 0.4)', labels = {}, easing = Easing.elastic(0.7), isFirstStep, isLastStep, maskOffset, borderRadius, dismissOnPress, } = props;
    const [containerVisible, setContainerVisible] = React.useState(false);
    const [layout, setLayout] = React.useState();
    const [size, setSize] = React.useState();
    const [position, setPosition] = React.useState();
    const tooltipTranslateY = React.useRef(new Animated.Value(400)).current;
    const opacity = React.useRef(new Animated.Value(0)).current;
    const layoutRef = React.useRef({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const handleLayoutChange = React.useCallback(({ nativeEvent }) => {
        layoutRef.current = nativeEvent.layout;
    }, []);
    const measure = React.useCallback(() => {
        if (typeof __TEST__ !== 'undefined' && __TEST__) {
            return Promise.resolve({
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            });
        }
        return new Promise((resolve) => {
            const setLayoutFunc = () => {
                if (layoutRef.current && layoutRef.current.width !== 0) {
                    resolve(layoutRef.current);
                }
                else {
                    requestAnimationFrame(setLayoutFunc);
                }
            };
            setLayoutFunc();
        });
    }, []);
    const _animateMove = React.useCallback(async (obj = {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
    }) => {
        const measuredLayout = await measure();
        if (!androidStatusBarVisible && Platform.OS === 'android') {
            obj.top -= StatusBar.currentHeight || 30;
        }
        const center = {
            x: obj.left + obj.width / 2,
            y: obj.top + obj.height / 2,
        };
        const relativeToLeft = center.x;
        const relativeToTop = center.y;
        const relativeToBottom = Math.abs(center.y - measuredLayout.height);
        const relativeToRight = Math.abs(center.x - measuredLayout.width);
        const verticalPosition = relativeToBottom > relativeToTop ? 'bottom' : 'top';
        const horizontalPosition = relativeToLeft > relativeToRight ? 'left' : 'right';
        const tooltip = {
            top: 0,
            tooltip: 0,
            bottom: 0,
            right: 0,
            maxWidth: 0,
            left: 0,
        };
        if (verticalPosition === 'bottom') {
            tooltip.top = obj.top + obj.height + MARGIN;
        }
        else {
            tooltip.bottom = measuredLayout.height - (obj.top - MARGIN);
        }
        if (horizontalPosition === 'left') {
            tooltip.right = Math.max(measuredLayout.width - (obj.left + obj.width), 0);
            tooltip.right =
                tooltip.right === 0 ? tooltip.right + MARGIN : tooltip.right;
            tooltip.maxWidth = measuredLayout.width - tooltip.right - MARGIN;
        }
        else {
            tooltip.left = Math.max(obj.left, 0);
            tooltip.left =
                tooltip.left === 0 ? tooltip.left + MARGIN : tooltip.left;
            tooltip.maxWidth = measuredLayout.width - tooltip.left - MARGIN;
        }
        const duration = animationDuration + 200;
        const toValue = verticalPosition === 'bottom'
            ? tooltip.top
            : obj.top - MARGIN - 135 - ((currentStep === null || currentStep === void 0 ? void 0 : currentStep.tooltipBottomOffset) || 0);
        const translateAnim = Animated.timing(tooltipTranslateY, {
            toValue,
            duration,
            easing,
            delay: duration,
            useNativeDriver: true,
        });
        const opacityAnim = Animated.timing(opacity, {
            toValue: 1,
            duration,
            easing,
            delay: duration,
            useNativeDriver: true,
        });
        opacity.setValue(0);
        if (!(currentStep === null || currentStep === void 0 ? void 0 : currentStep.keepTooltipPosition)) {
            Animated.parallel([translateAnim, opacityAnim]).start();
        }
        else {
            opacityAnim.start();
        }
        setLayout(measuredLayout);
        setSize({
            x: obj.width,
            y: obj.height,
        });
        setPosition({
            x: Math.floor(Math.max(obj.left, 0)),
            y: Math.floor(Math.max(obj.top, 0)),
        });
    }, [
        measure,
        androidStatusBarVisible,
        animationDuration,
        currentStep === null || currentStep === void 0 ? void 0 : currentStep.tooltipBottomOffset,
        currentStep === null || currentStep === void 0 ? void 0 : currentStep.keepTooltipPosition,
        tooltipTranslateY,
        easing,
        opacity,
    ]);
    const animateMove = React.useCallback((obj) => {
        return new Promise((resolve) => {
            setContainerVisible(true);
            _animateMove(obj).then(resolve);
        });
    }, [_animateMove]);
    const reset = React.useCallback(() => {
        setContainerVisible(false);
        setLayout(undefined);
    }, []);
    React.useEffect(() => {
        if (props.visible === false) {
            reset();
        }
    }, [props.visible, reset]);
    const handleNext = () => {
        props.next();
    };
    const handlePrev = () => {
        props.prev();
    };
    const handleStop = () => {
        reset();
        props.stop();
    };
    React.useImperativeHandle(ref, () => ({
        animateMove,
    }));
    if (!containerVisible) {
        return null;
    }
    return (React.createElement(RNModal, { animationType: "none", visible: containerVisible, onRequestClose: noop, transparent: true, statusBarTranslucent: Platform.OS === 'android' && Platform.Version >= 35, supportedOrientations: ['portrait', 'landscape'] },
        React.createElement(View, { style: [StyleSheet.absoluteFill, style.background], pointerEvents: "box-none" },
            React.createElement(View, { style: styles.container, onLayout: handleLayoutChange, pointerEvents: "box-none" }, layout && containerVisible && (React.createElement(React.Fragment, null,
                React.createElement(SvgMask, { style: styles.overlayContainer, size: size, position: position, easing: easing, animationDuration: animationDuration, backdropColor: backdropColor, currentStep: currentStep, maskOffset: maskOffset, borderRadius: borderRadius, dismissOnPress: dismissOnPress, stop: props.stop }),
                visible && (React.createElement(Animated.View, { pointerEvents: "box-none", key: "tooltip", style: [
                        styles.tooltip,
                        tooltipStyle,
                        {
                            opacity,
                            transform: [{ translateY: tooltipTranslateY }],
                        },
                    ] },
                    React.createElement(TooltipComponent, { isFirstStep: isFirstStep, isLastStep: isLastStep, currentStep: currentStep, handleNext: handleNext, handlePrev: handlePrev, handleStop: handleStop, labels: labels })))))))));
});
const style = StyleSheet.create({
    background: {
        backgroundColor: 'transparent',
    },
});
function noop() { }
