import React, { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Labels } from '../types';
import { TooltipProps } from './Tooltip';
export interface TourGuideProviderProps {
    tooltipComponent?: React.ComponentType<TooltipProps>;
    tooltipStyle?: StyleProp<ViewStyle>;
    labels?: Labels;
    androidStatusBarVisible?: boolean;
    startAtMount?: string | boolean;
    backdropColor?: string;
    verticalOffset?: number;
    wrapperStyle?: StyleProp<ViewStyle>;
    maskOffset?: number;
    borderRadius?: number;
    animationDuration?: number;
    children: ReactNode;
    dismissOnPress?: boolean;
}
export declare const TourGuideProvider: ({ children, wrapperStyle, labels, tooltipComponent, tooltipStyle, androidStatusBarVisible, backdropColor, animationDuration, maskOffset, borderRadius, verticalOffset, startAtMount, dismissOnPress, }: TourGuideProviderProps) => JSX.Element;