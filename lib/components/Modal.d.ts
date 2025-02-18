import * as React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { BorderRadiusObject, IStep, Labels } from '../types';
import { TooltipProps } from './Tooltip';
export interface ModalProps {
    ref: any;
    currentStep?: IStep;
    visible?: boolean;
    isFirstStep: boolean;
    isLastStep: boolean;
    animationDuration?: number;
    tooltipComponent?: React.ComponentType<TooltipProps>;
    tooltipStyle?: StyleProp<ViewStyle>;
    maskOffset?: number;
    borderRadius?: number;
    borderRadiusObject?: BorderRadiusObject;
    androidStatusBarVisible?: boolean;
    backdropColor?: string;
    labels?: Labels;
    dismissOnPress?: boolean;
    easing?: (value: number) => number;
    stop: () => void;
    next: () => void;
    prev: () => void;
}
interface Move {
    top: number;
    left: number;
    width: number;
    height: number;
}
export interface ModalRef {
    animateMove: (obj?: Move) => Promise<void>;
}
export declare const Modal: React.ForwardRefExoticComponent<Omit<ModalProps, "ref"> & React.RefAttributes<ModalRef>>;
export {};
