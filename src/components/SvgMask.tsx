import React from 'react'
import {
  Animated,
  Easing,
  StyleProp,
  View,
  ViewStyle,
  TouchableWithoutFeedback,
  useAnimatedValue,
  useWindowDimensions,
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
  const requestNextID = React.useRef<number>()
  const windowDimensions = useWindowDimensions()
  const firstPath = React.useMemo(
    () =>
      `M0,0H${windowDimensions.width}V${windowDimensions.height}H0V0ZM${
        windowDimensions.width / 2
      },${windowDimensions.height / 2} h 1 v 1 h -1 Z`,
    [windowDimensions.width, windowDimensions.height],
  )
  const previousPathRef = React.useRef(firstPath)
  const [path, setPath] = React.useState(firstPath)
  const pathRef = React.useRef(firstPath)
  const opacity = useAnimatedValue(0)
  const opacityRef = React.useRef(0)
  const animation = useAnimatedValue(0)
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
      requestNextID.current = requestAnimationFrame(() => {
        pathRef.current = d
        setPath(d)
      })
    },
    [getPath],
  )

  const animate = React.useCallback(() => {
    animation.setValue(0)

    const animations = [
      Animated.timing(animation, {
        toValue: 1,
        duration: animationDuration,
        easing,
        useNativeDriver: false,
      }),
    ]

    if (opacityRef.current !== 1) {
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
      }
    })
  }, [animationDuration, easing, opacity, animation])

  const opacityListener = React.useCallback<Animated.ValueListenerCallback>(
    (state) => {
      opacityRef.current = state.value
    },
    [],
  )

  React.useEffect(() => {
    const listenerID1 = opacity.addListener(opacityListener)
    const listenerID2 = animation.addListener(animationListener)
    return () => {
      opacity.removeListener(listenerID1)
      animation.removeListener(listenerID2)
      if (requestNextID.current) {
        cancelAnimationFrame(requestNextID.current)
      }
    }
  }, [animationListener, animation, opacityListener, opacity])

  React.useEffect(() => {
    animate()
  }, [position, size, animate])

  const Wrapper: any = dismissOnPress ? TouchableWithoutFeedback : View

  return (
    <Wrapper style={style} onPress={dismissOnPress ? stop : undefined}>
      <Svg pointerEvents="none" width={'100%'} height={'100%'}>
        <SvgPath
          ref={svgPathRef}
          fill={backdropColor}
          strokeWidth={0}
          fillRule="evenodd"
          d={path}
          opacity={opacity as any}
        />
      </Svg>
    </Wrapper>
  )
}
