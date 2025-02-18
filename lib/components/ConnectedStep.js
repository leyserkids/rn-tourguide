import * as React from 'react';
export const ConnectedStep = ({ active = true, children, context, tourKey, name, borderRadius, ...otherProps }) => {
    const wrapperRef = React.useRef(null);
    const register = React.useCallback(() => {
        if (context && context.registerStep) {
            context.registerStep(tourKey, {
                target: null,
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
    const copilot = {
        ref: wrapperRef,
        onLayout: () => { },
    };
    return React.cloneElement(children, { copilot });
};
