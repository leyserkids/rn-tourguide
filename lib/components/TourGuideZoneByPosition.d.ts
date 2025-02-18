import React from 'react';
import { StyleProp, ViewStyle, type DimensionValue } from 'react-native';
import { BorderRadiusObject, Shape } from '../types';
export interface TourGuideZoneByPositionProps {
    zone: number;
    tourKey?: string;
    active?: boolean;
    top?: DimensionValue;
    left?: DimensionValue;
    right?: DimensionValue;
    bottom?: DimensionValue;
    width?: DimensionValue;
    height?: DimensionValue;
    shape?: Shape;
    borderRadiusObject?: BorderRadiusObject;
    containerStyle?: StyleProp<ViewStyle>;
    keepTooltipPosition?: boolean;
    tooltipBottomOffset?: number;
    text?: string;
}
export declare const TourGuideZoneByPosition: ({ active, zone, tourKey, width, height, top, left, right, bottom, shape, containerStyle, keepTooltipPosition, tooltipBottomOffset, borderRadiusObject, text, }: TourGuideZoneByPositionProps) => React.JSX.Element | null;
