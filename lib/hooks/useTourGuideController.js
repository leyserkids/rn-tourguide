import React, { useCallback, useMemo } from 'react';
import { TourGuideContext } from '../components/TourGuideContext';
import { TourGuideZone } from '../components/TourGuideZone';
import { TourGuideZoneByPosition, } from '../components/TourGuideZoneByPosition';
export const useTourGuideController = (tourKey) => {
    const { start, canStart, stop, eventEmitter, getCurrentStep, setTourKey } = React.useContext(TourGuideContext);
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
    React.useEffect(() => {
        setTourKey && setTourKey(key);
    }, [key, setTourKey]);
    return useMemo(() => ({
        start: _start,
        stop: _stop,
        eventEmitter: eventEmitter ? eventEmitter[key] : undefined,
        getCurrentStep: _getCurrentStep,
        canStart: canStart ? canStart[key] : undefined,
        tourKey: key,
        TourGuideZone: KeyedTourGuideZone,
        TourGuideZoneByPosition: KeyedTourGuideZoneByPosition,
    }), [
        KeyedTourGuideZone,
        KeyedTourGuideZoneByPosition,
        _getCurrentStep,
        _start,
        _stop,
        canStart,
        eventEmitter,
        key,
    ]);
};
