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
    const [canStart, setCanStart] = useState({
        _default: false,
    });
    const startTries = useRef(0);
    const { current: mounted } = useIsMounted();
    const { current: eventEmitter } = useRef({
        _default: new mitt(),
    });
    const modal = useRef();
    const moveToCurrentStep = useCallback(async (key) => {
        var _a, _b;
        const size = await ((_a = currentStep[key]) === null || _a === void 0 ? void 0 : _a.target.measure());
        if (isNaN(size.width) ||
            isNaN(size.height) ||
            isNaN(size.x) ||
            isNaN(size.y)) {
            return;
        }
        await ((_b = modal.current) === null || _b === void 0 ? void 0 : _b.animateMove({
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
            (_a = eventEmitter[key]) === null || _a === void 0 ? void 0 : _a.emit('stepChange', step);
            return newStep;
        });
        resolve();
    }), [eventEmitter]);
    const getNextStep = (key, step = currentStep[key]) => utils.getNextStep(steps[key], step);
    const getPrevStep = (key, step = currentStep[key]) => utils.getPrevStep(steps[key], step);
    const getFirstStep = useCallback((key) => utils.getFirstStep(steps[key]), [steps]);
    const getLastStep = useCallback((key) => utils.getLastStep(steps[key]), [steps]);
    const _next = (key) => setCurrentStep(key, getNextStep(key));
    const _prev = (key) => setCurrentStep(key, getPrevStep(key));
    const _stop = (key) => {
        setVisible(key, false);
        setCurrentStep(key, undefined);
    };
    const registerStep = (key, step) => {
        setSteps((previousSteps) => {
            const newSteps = { ...previousSteps };
            newSteps[key] = {
                ...previousSteps[key],
                [step.name]: step,
            };
            return newSteps;
        });
        if (!eventEmitter[key]) {
            eventEmitter[key] = new mitt();
        }
    };
    const unregisterStep = (key, stepName) => {
        if (!mounted) {
            return;
        }
        setSteps((previousSteps) => {
            const newSteps = { ...previousSteps };
            newSteps[key] = Object.entries(previousSteps[key])
                .filter(([k]) => k !== stepName)
                .reduce((obj, [k, v]) => Object.assign(obj, { [k]: v }), {});
            return newSteps;
        });
    };
    const getCurrentStep = (key) => currentStep[key];
    const start = useCallback(async (key, fromStep) => {
        var _a;
        const newCurrentStep = fromStep
            ? steps[key][fromStep]
            : getFirstStep(key);
        if (startTries.current > MAX_START_TRIES) {
            startTries.current = 0;
            return;
        }
        if (!newCurrentStep) {
            startTries.current += 1;
            requestAnimationFrame(() => start(key, fromStep));
        }
        else {
            (_a = eventEmitter[key]) === null || _a === void 0 ? void 0 : _a.emit('start');
            await setCurrentStep(key, newCurrentStep);
            setVisible(key, true);
            startTries.current = 0;
        }
    }, [eventEmitter, getFirstStep, setCurrentStep, steps]);
    const next = () => _next(tourKey);
    const prev = () => _prev(tourKey);
    const stop = () => _stop(tourKey);
    useEffect(() => {
        var _a;
        if (mounted && visible[tourKey] === false) {
            (_a = eventEmitter[tourKey]) === null || _a === void 0 ? void 0 : _a.emit('stop');
        }
    }, [eventEmitter, mounted, tourKey, visible]);
    useEffect(() => {
        if (visible[tourKey] || currentStep[tourKey]) {
            moveToCurrentStep(tourKey);
        }
    }, [visible, currentStep, tourKey, moveToCurrentStep]);
    useEffect(() => {
        if (mounted) {
            if (steps[tourKey]) {
                if ((Array.isArray(steps[tourKey]) && steps[tourKey].length > 0) ||
                    Object.entries(steps[tourKey]).length > 0) {
                    setCanStart((obj) => {
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
                    setCanStart((obj) => {
                        const newObj = { ...obj };
                        newObj[tourKey] = false;
                        return newObj;
                    });
                }
            }
        }
    }, [mounted, start, startAtMount, steps, tourKey]);
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
    return (React.createElement(View, { style: [styles.container, wrapperStyle] },
        React.createElement(TourGuideContext.Provider, { value: {
                eventEmitter,
                registerStep,
                unregisterStep,
                getCurrentStep,
                start,
                stop,
                canStart,
                setTourKey,
            } },
            children,
            React.createElement(Modal, Object.assign({ ref: modal }, {
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
            })))));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
