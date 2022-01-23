import React from 'react';
import { Emitter } from '../components/TourGuideContext';
import { TourGuideZoneProps } from '../components/TourGuideZone';
import { TourGuideZoneByPositionProps } from '../components/TourGuideZoneByPosition';
declare type GetEventEmitter = () => Emitter;
export declare const useTourGuideController: (tourKey?: string | undefined) => {
    start: (fromStep?: number | undefined) => void;
    stop: () => void;
    getEventEmitter: GetEventEmitter | undefined;
    getCurrentStep: () => import("..").IStep | undefined;
    canStart: () => boolean;
    TourGuideZone: React.FC<Pick<TourGuideZoneProps, "borderRadius" | "borderRadiusObject" | "shape" | "maskOffset" | "text" | "children" | "keepTooltipPosition" | "tooltipBottomOffset" | "style" | "isTourGuide" | "zone">>;
    TourGuideZoneByPosition: React.FC<Pick<TourGuideZoneByPositionProps, "borderRadiusObject" | "shape" | "text" | "keepTooltipPosition" | "tooltipBottomOffset" | "isTourGuide" | "zone" | "left" | "right" | "width" | "height" | "bottom" | "top" | "containerStyle">>;
};
export {};
