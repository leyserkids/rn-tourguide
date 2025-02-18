import * as React from 'react';
export const ConnectedStep = ({ active = true, children, context, tourKey, name, borderRadius, ...otherProps }) => {
    const wrapperRef = React.useRef(null);
    const componentRef = React.useRef({});
    const measure = React.useCallback(() => {
        if (typeof __TEST__ !== 'undefined' && __TEST__) {
            return new Promise((resolve) => resolve({
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            }));
        }
        return new Promise((resolve, reject) => {
            const measureFn = () => {
                if (wrapperRef.current && wrapperRef.current.measure) {
                    wrapperRef.current.measure((_ox, _oy, width, height, x, y) => resolve({
                        x: borderRadius ? x + borderRadius : x,
                        y,
                        width: borderRadius ? width - borderRadius * 2 : width,
                        height,
                    }), reject);
                }
                else {
                    requestAnimationFrame(measureFn);
                }
            };
            requestAnimationFrame(measureFn);
        });
    }, [borderRadius]);
    React.useEffect(() => {
        componentRef.current.measure = measure;
    }, [measure]);
    const register = React.useCallback(() => {
        if (context && context.registerStep) {
            context.registerStep(tourKey, {
                target: componentRef.current,
                wrapper: wrapperRef.current,
                name,
                borderRadius,
                ...otherProps,
            });
        }
        else {
            console.warn('context undefined');
        }
    }, [context, tourKey, name, borderRadius, otherProps]);
    const unregister = React.useCallback(() => {
        if (context && context.unregisterStep) {
            context.unregisterStep(tourKey, name);
        }
        else {
            console.warn('unregisterStep undefined');
        }
    }, [context, tourKey, name]);
    React.useEffect(() => {
        if (active) {
            register();
        }
        return () => {
            unregister();
        };
    }, [active, register, unregister]);
    const copilot = React.useMemo(() => ({
        ref: (wrapper) => {
            wrapperRef.current = wrapper;
        },
        onLayout: () => { },
    }), []);
    return React.cloneElement(children, { copilot });
};
