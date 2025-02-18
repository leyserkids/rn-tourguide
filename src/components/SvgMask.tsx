import React from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  LayoutChangeEvent,
  Platform,
  StyleProp,
  View,
  ViewStyle,
  TouchableWithoutFeedback,
} from 'react-native'
import Svg, { PathProps } from 'react-native-svg'
import { IStep, ValueXY } from '../types'
import { svgMaskPathMorph } from '../utilities'
import { AnimatedSvgPath } from './AnimatedPath'

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

const IS_WEB = Platform.OS !== 'web'

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
  const windowDimensions = Dimensions.get('window')
  const [canvasSize, setCanvasSize] = React.useState({
    x: windowDimensions.width,
    y: windowDimensions.height,
  })
  const mask = React.useRef<PathProps>(null)
  const rafID = React.useRef<number>()

  const firstPath = `M0,0H${windowDimensions.width}V${
    windowDimensions.height
  }H0V0ZM${windowDimensions.width / 2},${
    windowDimensions.height / 2
  } h 1 v 1 h -1 Z`

  const [state, setState] = React.useState({
    opacity: new Animated.Value(0),
    animation: new Animated.Value(0),
    previousPath: firstPath,
  })

  const getPath = React.useCallback(() => {
    const path = svgMaskPathMorph({
      animation: state.animation as any,
      previousPath: state.previousPath,
      to: {
        position,
        size,
        shape: currentStep?.shape,
        maskOffset: currentStep?.maskOffset || maskOffset,
        borderRadius: currentStep?.borderRadius || borderRadius,
        borderRadiusObject: currentStep?.borderRadiusObject,
      },
    })
    return path
  }, [
    state.animation,
    state.previousPath,
    position,
    size,
    currentStep,
    maskOffset,
    borderRadius,
  ])

  const animationListener = React.useCallback(() => {
    const d = getPath()
    rafID.current = requestAnimationFrame(() => {
      if (mask.current) {
        if (IS_WEB) {
          // @ts-ignore
          mask.current.setNativeProps({ d })
        } else {
          // @ts-ignore
          mask.current._touchableNode.setAttribute('d', d)
        }
      }
    })
  }, [getPath])

  const animate = React.useCallback(() => {
    const animations = [
      Animated.timing(state.animation, {
        toValue: 1,
        duration: animationDuration,
        easing,
        useNativeDriver: false,
      }),
    ]

    // @ts-ignore
    if (state.opacity._value !== 1) {
      animations.push(
        Animated.timing(state.opacity, {
          toValue: 1,
          duration: animationDuration,
          easing,
          useNativeDriver: true,
        }),
      )
    }

    Animated.parallel(animations, { stopTogether: false }).start((result) => {
      if (result.finished) {
        setState((prev) => ({ ...prev, previousPath: getPath() }))
        // @ts-ignore
        if (state.animation._value === 1) {
          state.animation.setValue(0)
        }
      }
    })
  }, [state.animation, state.opacity, animationDuration, easing, getPath])

  React.useEffect(() => {
    const listenerID = state.animation.addListener(animationListener)
    return () => {
      state.animation.removeListener(listenerID)
      if (rafID.current) {
        cancelAnimationFrame(rafID.current)
      }
    }
  }, [state.animation, animationListener])

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
        <AnimatedSvgPath
          ref={mask}
          fill={backdropColor}
          strokeWidth={0}
          fillRule="evenodd"
          d={firstPath}
          opacity={state.opacity as any}
        />
      </Svg>
    </Wrapper>
  )
}
