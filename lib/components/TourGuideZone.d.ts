import * as React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { BorderRadiusObject, Shape } from '../types';
export interface TourGuideZoneProps {
    zone: number;
    tourKey?: string;
    text?: string;
    active?: boolean;
    moveIntoView?: () => void | Promise<void>;
    shape?: Shape;
    maskOffset?: number;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
    keepTooltipPosition?: boolean;
    tooltipBottomOffset?: number;
    borderRadiusObject?: BorderRadiusObject;
    children?: React.ReactNode;
}
export declare const TourGuideZone: ({ active, tourKey, zone, children, shape, text, moveIntoView, maskOffset, borderRadius, style, keepTooltipPosition, tooltipBottomOffset, borderRadiusObject, }: TourGuideZoneProps) => JSX.Element;
