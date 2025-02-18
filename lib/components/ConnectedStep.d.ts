import * as React from 'react';
import { BorderRadiusObject, Shape } from '../types';
import { ITourGuideContext } from './TourGuideContext';
interface Props {
    name: string;
    text: string;
    order: number;
    tourKey: string;
    active?: boolean;
    moveIntoView?: () => void | Promise<void>;
    shape?: Shape;
    context: ITourGuideContext;
    children?: any;
    maskOffset?: number;
    borderRadiusObject?: BorderRadiusObject;
    borderRadius?: number;
    keepTooltipPosition?: boolean;
    tooltipBottomOffset?: number;
}
export declare const ConnectedStep: React.FC<Props>;
export {};
