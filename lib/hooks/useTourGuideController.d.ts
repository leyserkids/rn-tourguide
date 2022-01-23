import * as React from 'react';
import { TourGuideZoneProps } from '../components/TourGuideZone';
import { TourGuideZoneByPositionProps } from '../components/TourGuideZoneByPosition';
export declare const useTourGuideController: (tourKey?: string | undefined) => {
    start: (fromStep?: number | undefined) => void;
    stop: () => void;
    eventEmitter: import("../components/TourGuideContext").Emitter | undefined;
    getCurrentStep: () => import("..").IStep | undefined;
    canStart: boolean | undefined;
    tourKey: string;
    TourGuideZone: React.FC<Pick<TourGuideZoneProps, "text" | "shape" | "children" | "maskOffset" | "borderRadiusObject" | "borderRadius" | "keepTooltipPosition" | "tooltipBottomOffset" | "style" | "isTourGuide" | "zone">>;
    TourGuideZoneByPosition: React.FC<Pick<TourGuideZoneByPositionProps, "text" | "shape" | "borderRadiusObject" | "keepTooltipPosition" | "tooltipBottomOffset" | "isTourGuide" | "zone" | "left" | "right" | "width" | "height" | "bottom" | "top" | "containerStyle">>;
};
