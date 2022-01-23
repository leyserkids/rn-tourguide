import mitt from 'mitt';
import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { StyleSheet, View } from 'react-native';
import { TourGuideContext } from './TourGuideContext';
import { useIsMounted } from '../hooks/useIsMounted';
import * as utils from '../utilities';
import { Modal } from './Modal';
import { OFFSET_WIDTH } from './style';
const MAX_START_TRIES = 120;
export const TourGuideProvider = ({ children, wrapperStyle, labels, tooltipComponent, tooltipStyle, androidStatusBarVisible, backdropColor, animationDuration, maskOffset, borderRadius, verticalOffset, startAtMount = false, dismissOnPress = false, }) => {
    const [tourKey, setTourKey] = useState('_default');
    const [visible, updateVisible] = useState({
        _default: false,
    });
    const setVisible = (key, value) => updateVisible((perVisible) => {
        const newVisible = { ...perVisible };
        newVisible[key] = value;
        return newVisible;
    });
    const [currentStep, updateCurrentStep] = useState({
        _default: undefined,
    });
    const [steps, setSteps] = useState({ _default: [] });
    const [canStartFlag, setCanStartFlag] = useState({
        _default: false,
    });
    const startTriesRef = useRef(0);
    const mountedRef = useIsMounted();
    const eventEmitterRef = useRef({
        _default: new mitt(),
    });
    const modalRef = useRef();
    const moveToCurrentStep = useCallback(async (key) => {
        var _a, _b;
        const size = await ((_a = currentStep[key]) === null || _a === void 0 ? void 0 : _a.target.measure());
        if (isNaN(size.width) ||
            isNaN(size.height) ||
            isNaN(size.x) ||
            isNaN(size.y)) {
            return;
        }
        await ((_b = modalRef.current) === null || _b === void 0 ? void 0 : _b.animateMove({
            width: size.width + OFFSET_WIDTH,
            height: size.height + OFFSET_WIDTH,
            left: Math.round(size.x) - OFFSET_WIDTH / 2,
            top: Math.round(size.y) - OFFSET_WIDTH / 2 + (verticalOffset || 0),
        }));
    }, [currentStep, verticalOffset]);
    const setCurrentStep = useCallback((key, step) => new Promise((resolve) => {
        updateCurrentStep((preCurrentStep) => {
            var _a;
            const newStep = { ...preCurrentStep };
            newStep[key] = step;
            (_a = eventEmitterRef.current[key]) === null || _a === void 0 ? void 0 : _a.emit('stepChange', step);
            return newStep;
        });
        resolve();
    }), []);
    const getNextStep = useCallback((key, step = currentStep[key]) => utils.getNextStep(steps[key], step), [currentStep, steps]);
    const getPrevStep = useCallback((key, step = currentStep[key]) => utils.getPrevStep(steps[key], step), [currentStep, steps]);
    const getFirstStep = useCallback((key) => utils.getFirstStep(steps[key]), [steps]);
    const getLastStep = useCallback((key) => utils.getLastStep(steps[key]), [steps]);
    const _next = useCallback((key) => setCurrentStep(key, getNextStep(key)), [getNextStep, setCurrentStep]);
    const _prev = useCallback((key) => setCurrentStep(key, getPrevStep(key)), [getPrevStep, setCurrentStep]);
    const _stop = useCallback((key) => {
        setVisible(key, false);
        setCurrentStep(key, undefined);
    }, [setCurrentStep]);
    const registerStep = useCallback((key, step) => {
        setSteps((previousSteps) => {
            const newSteps = { ...previousSteps };
            newSteps[key] = {
                ...previousSteps[key],
                [step.name]: step,
            };
            return newSteps;
        });
        if (!eventEmitterRef.current[key]) {
            eventEmitterRef.current[key] = new mitt();
        }
    }, []);
    const unregisterStep = useCallback((key, stepName) => {
        if (!mountedRef.current) {
            return;
        }
        setSteps((previousSteps) => {
            const newSteps = { ...previousSteps };
            newSteps[key] = Object.entries(previousSteps[key])
                .filter(([k]) => k !== stepName)
                .reduce((obj, [k, v]) => Object.assign(obj, { [k]: v }), {});
            return newSteps;
        });
    }, [mountedRef]);
    const getCurrentStep = useCallback((key) => currentStep[key], [currentStep]);
    const start = useCallback(async (key, fromStep) => {
        var _a;
        const newCurrentStep = fromStep
            ? steps[key][fromStep]
            : getFirstStep(key);
        if (startTriesRef.current > MAX_START_TRIES) {
            startTriesRef.current = 0;
            return;
        }
        if (!newCurrentStep) {
            startTriesRef.current += 1;
            requestAnimationFrame(() => start(key, fromStep));
        }
        else {
            (_a = eventEmitterRef.current[key]) === null || _a === void 0 ? void 0 : _a.emit('start');
            await setCurrentStep(key, newCurrentStep);
            setVisible(key, true);
            startTriesRef.current = 0;
        }
    }, [getFirstStep, setCurrentStep, steps]);
    const next = useCallback(() => _next(tourKey), [_next, tourKey]);
    const prev = useCallback(() => _prev(tourKey), [_prev, tourKey]);
    const stop = useCallback(() => _stop(tourKey), [_stop, tourKey]);
    useEffect(() => {
        var _a;
        if (mountedRef.current && visible[tourKey] === false) {
            (_a = eventEmitterRef.current[tourKey]) === null || _a === void 0 ? void 0 : _a.emit('stop');
        }
    }, [mountedRef, tourKey, visible]);
    useEffect(() => {
        if (visible[tourKey] || currentStep[tourKey]) {
            moveToCurrentStep(tourKey);
        }
    }, [visible, currentStep, tourKey, moveToCurrentStep]);
    useEffect(() => {
        if (mountedRef.current) {
            if (steps[tourKey]) {
                if ((Array.isArray(steps[tourKey]) && steps[tourKey].length > 0) ||
                    Object.entries(steps[tourKey]).length > 0) {
                    setCanStartFlag((obj) => {
                        const newObj = { ...obj };
                        newObj[tourKey] = true;
                        return newObj;
                    });
                    if (typeof startAtMount === 'string') {
                        start(startAtMount);
                    }
                    else if (startAtMount) {
                        start('_default');
                    }
                }
                else {
                    setCanStartFlag((obj) => {
                        const newObj = { ...obj };
                        newObj[tourKey] = false;
                        return newObj;
                    });
                }
            }
        }
    }, [mountedRef, start, startAtMount, steps, tourKey]);
    const isFirstStep = useMemo(() => {
        const obj = {};
        Object.keys(currentStep).forEach((key) => {
            obj[key] = currentStep[key] === getFirstStep(key);
        });
        return obj;
    }, [currentStep, getFirstStep]);
    const isLastStep = useMemo(() => {
        const obj = {};
        Object.keys(currentStep).forEach((key) => {
            obj[key] = currentStep[key] === getLastStep(key);
        });
        return obj;
    }, [currentStep, getLastStep]);
    const containerStyle = useMemo(() => StyleSheet.flatten([styles.container, wrapperStyle]), [wrapperStyle]);
    const canStart = useCallback((key = '_default') => canStartFlag[key], [canStartFlag]);
    const getEventEmitter = useCallback(() => eventEmitterRef.current, []);
    const ctx = useMemo(() => ({
        canStart,
        getEventEmitter,
        registerStep,
        unregisterStep,
        getCurrentStep,
        start,
        stop,
        setTourKey,
    }), [
        canStart,
        getCurrentStep,
        getEventEmitter,
        registerStep,
        start,
        stop,
        unregisterStep,
    ]);
    const modalProps = useMemo(() => ({
        next,
        prev,
        stop,
        visible: visible[tourKey],
        isFirstStep: isFirstStep[tourKey],
        isLastStep: isLastStep[tourKey],
        currentStep: currentStep[tourKey],
        labels,
        tooltipComponent,
        tooltipStyle,
        androidStatusBarVisible,
        backdropColor,
        animationDuration,
        maskOffset,
        borderRadius,
        dismissOnPress,
    }), [
        androidStatusBarVisible,
        animationDuration,
        backdropColor,
        borderRadius,
        currentStep,
        dismissOnPress,
        isFirstStep,
        isLastStep,
        labels,
        maskOffset,
        next,
        prev,
        stop,
        tooltipComponent,
        tooltipStyle,
        tourKey,
        visible,
    ]);
    return (React.createElement(View, { style: containerStyle },
        React.createElement(TourGuideContext.Provider, { value: ctx },
            children,
            React.createElement(Modal, Object.assign({ ref: modalRef }, modalProps)))));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
