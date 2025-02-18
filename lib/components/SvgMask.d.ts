import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { IStep, ValueXY } from '../types';
interface Props {
    size: ValueXY;
    position: ValueXY;
    style: StyleProp<ViewStyle>;
    animationDuration?: number;
    backdropColor: string;
    dismissOnPress?: boolean;
    maskOffset?: number;
    borderRadius?: number;
    currentStep?: IStep;
    easing: (value: number) => number;
    stop: () => void;
}
export declare const SvgMask: React.FC<Props>;
export {};
