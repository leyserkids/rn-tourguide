import React from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  LayoutChangeEvent,
  StyleProp,
  View,
  ViewStyle,
  TouchableWithoutFeedback,
  useAnimatedValue,
} from 'react-native'
import Svg, { Path as SvgPath } from 'react-native-svg'
import { IStep, ValueXY } from '../types'
import { svgMaskPathMorph } from '../utilities'

interface Props {
  size: ValueXY
  position: ValueXY
  style: StyleProp<ViewStyle>
  animationDuration?: number
  backdropColor: string
  dismissOnPress?: boolean
  maskOffset?: number
  borderRadius?: number
  currentStep?: IStep
  easing: (value: number) => number
  stop: () => void
}

export const SvgMask: React.FC<Props> = ({
  size = { x: 0, y: 0 },
  position = { x: 0, y: 0 },
  style,
  animationDuration,
  backdropColor,
  dismissOnPress,
  maskOffset = 0,
  borderRadius,
  currentStep,
  easing = Easing.linear,
  stop,
}) => {
  const rafID = React.useRef<number>()
  const windowDimensions = Dimensions.get('window')
  const [canvasSize, setCanvasSize] = React.useState({
    x: windowDimensions.width,
    y: windowDimensions.height,
  })
  const firstPath = React.useMemo(
    () =>
      `M0,0H${windowDimensions.width}V${windowDimensions.height}H0V0ZM${
        windowDimensions.width / 2
      },${windowDimensions.height / 2} h 1 v 1 h -1 Z`,
    [windowDimensions.width, windowDimensions.height],
  )
  const previousPathRef = React.useRef(firstPath)
  const pathRef = React.useRef(firstPath)
  const opacity = useAnimatedValue(0)
  const animation = useAnimatedValue(0)
  const currentAnimationRef = React.useRef(0)
  const svgPathRef = React.useRef<SvgPath>(null)

  const getPath = React.useCallback(
    (v: number) => {
      const d = svgMaskPathMorph({
        animation: v,
        previousPath: previousPathRef.current,
        to: {
          position,
          size,
          shape: currentStep?.shape,
          maskOffset: currentStep?.maskOffset || maskOffset,
          borderRadius: currentStep?.borderRadius || borderRadius,
          borderRadiusObject: currentStep?.borderRadiusObject,
        },
      })
      return d
    },
    [
      position,
      size,
      currentStep?.shape,
      currentStep?.maskOffset,
      currentStep?.borderRadius,
      currentStep?.borderRadiusObject,
      maskOffset,
      borderRadius,
    ],
  )

  const animationListener = React.useCallback<Animated.ValueListenerCallback>(
    (state) => {
      const d = getPath(state.value)
      rafID.current = requestAnimationFrame(() => {
        svgPathRef.current?.setNativeProps({ d })
        pathRef.current = d
        currentAnimationRef.current = state.value
      })
    },
    [getPath],
  )

  const animate = React.useCallback(() => {
    const animations = [
      Animated.timing(animation, {
        toValue: 1,
        duration: animationDuration,
        easing,
        useNativeDriver: false,
      }),
    ]

    // @ts-ignore
    if (opacity._value !== 1) {
      animations.push(
        Animated.timing(opacity, {
          toValue: 1,
          duration: animationDuration,
          easing,
          useNativeDriver: true,
        }),
      )
    }

    Animated.parallel(animations, { stopTogether: false }).start((result) => {
      if (result.finished) {
        previousPathRef.current = pathRef.current
        animation.setValue(0)
      }
    })
  }, [animationDuration, easing, opacity, animation])

  React.useEffect(() => {
    const listenerID = animation.addListener(animationListener)
    return () => {
      animation.removeListener(listenerID)
      if (rafID.current) {
        cancelAnimationFrame(rafID.current)
      }
    }
  }, [animationListener, animation])

  React.useEffect(() => {
    animate()
  }, [position, size, animate])

  const handleLayout = (e: LayoutChangeEvent) => {
    setCanvasSize({
      x: e.nativeEvent.layout.width,
      y: e.nativeEvent.layout.height,
    })
  }

  const Wrapper: any = dismissOnPress ? TouchableWithoutFeedback : View

  return (
    <Wrapper
      style={style}
      onLayout={handleLayout}
      onPress={dismissOnPress ? stop : undefined}
    >
      <Svg pointerEvents="none" width={canvasSize.x} height={canvasSize.y}>
        <SvgPath
          ref={svgPathRef}
          fill={backdropColor}
          strokeWidth={0}
          fillRule="evenodd"
          d={firstPath}
          opacity={opacity as any}
        />
      </Svg>
    </Wrapper>
  )
}
