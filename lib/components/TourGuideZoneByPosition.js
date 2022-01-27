import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { TourGuideZone } from './TourGuideZone';
export const TourGuideZoneByPosition = ({ active, zone, tourKey = '_default', width, height, top, left, right, bottom, shape, containerStyle, keepTooltipPosition, tooltipBottomOffset, borderRadiusObject, text, }) => {
    const tourGuideZoneStyle = useMemo(() => ({
        position: 'absolute',
        height,
        width,
        top,
        right,
        bottom,
        left,
    }), [bottom, height, left, right, top, width]);
    if (!active) {
        return null;
    }
    return (React.createElement(View, { pointerEvents: "none", style: [StyleSheet.absoluteFillObject, containerStyle] },
        React.createElement(TourGuideZone, { active: true, ...{
                tourKey,
                zone,
                shape,
                keepTooltipPosition,
                tooltipBottomOffset,
                borderRadiusObject,
                text,
            }, style: tourGuideZoneStyle })));
};
