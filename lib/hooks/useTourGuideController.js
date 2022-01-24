import React, { useCallback, useMemo } from 'react';
import { TourGuideContext } from '../components/TourGuideContext';
import { TourGuideZone } from '../components/TourGuideZone';
import { TourGuideZoneByPosition, } from '../components/TourGuideZoneByPosition';
export const useTourGuideController = (tourKey) => {
    const { start, canStart, stop, getEventEmitter, getCurrentStep, setTourKey } = React.useContext(TourGuideContext);
    let key = tourKey !== null && tourKey !== void 0 ? tourKey : '_default';
    const _start = useCallback((fromStep) => {
        setTourKey && setTourKey(key);
        if (start) {
            start(key, fromStep);
        }
    }, [key, setTourKey, start]);
    const _stop = useCallback(() => {
        if (stop) {
            stop(key);
        }
    }, [key, stop]);
    const _getCurrentStep = useCallback(() => {
        if (getCurrentStep) {
            return getCurrentStep(key);
        }
        return undefined;
    }, [getCurrentStep, key]);
    const KeyedTourGuideZone = useCallback(({ children, ...rest }) => {
        return (React.createElement(TourGuideZone, Object.assign({}, rest, { tourKey: key }), children));
    }, [key]);
    const KeyedTourGuideZoneByPosition = React.useCallback((props) => {
        return React.createElement(TourGuideZoneByPosition, Object.assign({}, props, { tourKey: key }));
    }, [key]);
    const _getEventEmitter = useMemo(() => {
        const eventEmitter = getEventEmitter ? getEventEmitter() : undefined;
        return eventEmitter ? () => eventEmitter[key] : undefined;
    }, [getEventEmitter, key]);
    const _canStart = useCallback(() => canStart(key), [canStart, key]);
    return useMemo(() => ({
        start: _start,
        stop: _stop,
        getEventEmitter: _getEventEmitter,
        getCurrentStep: _getCurrentStep,
        canStart: _canStart,
        TourGuideZone: KeyedTourGuideZone,
        TourGuideZoneByPosition: KeyedTourGuideZoneByPosition,
    }), [
        KeyedTourGuideZone,
        KeyedTourGuideZoneByPosition,
        _canStart,
        _getCurrentStep,
        _getEventEmitter,
        _start,
        _stop,
    ]);
};
