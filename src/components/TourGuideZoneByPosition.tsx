import React, { useMemo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { BorderRadiusObject, Shape } from '../types'
import { TourGuideZone } from './TourGuideZone'

export interface TourGuideZoneByPositionProps {
  zone: number
  tourKey?: string
  active?: boolean
  top?: number | string
  left?: number | string
  right?: number | string
  bottom?: number | string
  width?: number | string
  height?: number | string
  shape?: Shape
  borderRadiusObject?: BorderRadiusObject
  containerStyle?: StyleProp<ViewStyle>
  keepTooltipPosition?: boolean
  tooltipBottomOffset?: number
  text?: string
}

export const TourGuideZoneByPosition = ({
  active,
  zone,
  tourKey = '_default',
  width,
  height,
  top,
  left,
  right,
  bottom,
  shape,
  containerStyle,
  keepTooltipPosition,
  tooltipBottomOffset,
  borderRadiusObject,
  text,
}: TourGuideZoneByPositionProps) => {
  const tourGuideZoneStyle = useMemo<StyleProp<ViewStyle>>(
    () => ({
      position: 'absolute',
      height,
      width,
      top,
      right,
      bottom,
      left,
    }),
    [bottom, height, left, right, top, width],
  )

  if (!active) {
    return null
  }

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, containerStyle]}
    >
      <TourGuideZone
        active
        {...{
          tourKey,
          zone,
          shape,
          keepTooltipPosition,
          tooltipBottomOffset,
          borderRadiusObject,
          text,
        }}
        style={tourGuideZoneStyle}
      />
    </View>
  )
}
