import mitt, { Emitter } from 'mitt'
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { TourGuideContext, Ctx } from './TourGuideContext'
import { useIsMounted } from '../hooks/useIsMounted'
import { IStep, Labels, StepObject, Steps } from '../types'
import * as utils from '../utilities'
import { Modal } from './Modal'
import { OFFSET_WIDTH } from './style'
import { TooltipProps } from './Tooltip'

/*
This is the maximum wait time for the steps to be registered before starting the tutorial
At 60fps means 2 seconds
*/
const MAX_START_TRIES = 120

export interface TourGuideProviderProps {
  tooltipComponent?: React.ComponentType<TooltipProps>
  tooltipStyle?: StyleProp<ViewStyle>
  labels?: Labels
  androidStatusBarVisible?: boolean
  startAtMount?: string | boolean
  backdropColor?: string
  verticalOffset?: number
  wrapperStyle?: StyleProp<ViewStyle>
  maskOffset?: number
  borderRadius?: number
  animationDuration?: number
  children: ReactNode
  dismissOnPress?: boolean
}

export const TourGuideProvider = ({
  children,
  wrapperStyle,
  labels,
  tooltipComponent,
  tooltipStyle,
  androidStatusBarVisible,
  backdropColor,
  animationDuration,
  maskOffset,
  borderRadius,
  verticalOffset,
  startAtMount = false,
  dismissOnPress = false,
}: TourGuideProviderProps) => {
  const [tourKey, setTourKey] = useState<string | '_default'>('_default')
  const [visible, updateVisible] = useState<Ctx<boolean | undefined>>({
    _default: false,
  })
  const setVisible = (key: string, value: boolean) =>
    updateVisible((perVisible) => {
      const newVisible = { ...perVisible }
      newVisible[key] = value
      return newVisible
    })
  const [currentStep, updateCurrentStep] = useState<Ctx<IStep | undefined>>({
    _default: undefined,
  })
  const stepsRef = useRef<Ctx<Steps>>({ _default: [] })

  const canStartFlagRef = useRef<Ctx<boolean>>({
    _default: false,
  })
  const updateCanStartFlag = useCallback((key: string) => {
    const newObj = { ...canStartFlagRef.current }
    if (
      (Array.isArray(stepsRef.current[key]) &&
        stepsRef.current[key].length > 0) ||
      Object.entries(stepsRef.current[key]).length > 0
    ) {
      newObj[key] = true
    } else {
      newObj[key] = false
    }
    canStartFlagRef.current = newObj
  }, [])

  const startTriesRef = useRef<number>(0)
  const mountedRef = useIsMounted()

  const eventEmitterRef = useRef<Ctx<Emitter>>({
    _default: new mitt(),
  })

  const modalRef = useRef<any>()

  const moveToCurrentStep = useCallback(
    async (key: string) => {
      await currentStep[key]?.moveIntoView?.()
      const size = await currentStep[key]?.target.measure()
      if (
        isNaN(size.width) ||
        isNaN(size.height) ||
        isNaN(size.x) ||
        isNaN(size.y)
      ) {
        return
      }
      await modalRef.current?.animateMove({
        width: size.width + OFFSET_WIDTH,
        height: size.height + OFFSET_WIDTH,
        left: Math.round(size.x) - OFFSET_WIDTH / 2,
        top: Math.round(size.y) - OFFSET_WIDTH / 2 + (verticalOffset || 0),
      })
    },
    [currentStep, verticalOffset],
  )

  const setCurrentStep = useCallback(
    (key: string, step?: IStep) =>
      new Promise<void>((resolve) => {
        updateCurrentStep((preCurrentStep) => {
          const newStep = { ...preCurrentStep }
          newStep[key] = step
          eventEmitterRef.current[key]?.emit('stepChange', step)
          return newStep
        })
        resolve()
      }),
    [],
  )

  const getNextStep = useCallback(
    (key: string, step: IStep | undefined = currentStep[key]) =>
      utils.getNextStep(stepsRef.current[key]!, step),
    [currentStep],
  )

  const getPrevStep = useCallback(
    (key: string, step: IStep | undefined = currentStep[key]) =>
      utils.getPrevStep(stepsRef.current[key]!, step),
    [currentStep],
  )

  const getFirstStep = useCallback(
    (key: string) => utils.getFirstStep(stepsRef.current[key]!),
    [],
  )

  const getLastStep = useCallback(
    (key: string) => utils.getLastStep(stepsRef.current[key]!),
    [],
  )
  const _next = useCallback(
    (key: string) => setCurrentStep(key, getNextStep(key)!),
    [getNextStep, setCurrentStep],
  )

  const _prev = useCallback(
    (key: string) => setCurrentStep(key, getPrevStep(key)!),
    [getPrevStep, setCurrentStep],
  )

  const _stop = useCallback(
    (key: string) => {
      setVisible(key, false)
      setCurrentStep(key, undefined)
    },
    [setCurrentStep],
  )

  const registerStep = useCallback(
    (key: string, step: IStep) => {
      const newSteps = { ...stepsRef.current }
      newSteps[key] = {
        ...stepsRef.current[key],
        [step.name]: step,
      }
      stepsRef.current = newSteps

      updateCanStartFlag(key)

      if (!eventEmitterRef.current[key]) {
        eventEmitterRef.current[key] = new mitt()
      }
    },
    [updateCanStartFlag],
  )

  const unregisterStep = useCallback(
    (key: string, stepName: string) => {
      if (!mountedRef.current) {
        return
      }
      const newSteps = { ...stepsRef.current }
      newSteps[key] = Object.entries(stepsRef.current[key] as StepObject)
        .filter(([k]) => k !== stepName)
        .reduce((obj, [k, v]) => Object.assign(obj, { [k]: v }), {})
      stepsRef.current = newSteps

      updateCanStartFlag(key)
    },
    [mountedRef, updateCanStartFlag],
  )

  // 'getCurrentStep' need passdown, should make it stable not change.
  const currentStepRef = useRef(currentStep)
  useEffect(() => {
    currentStepRef.current = currentStep
  }, [currentStep])
  const getCurrentStep = useCallback(
    (key: string) => currentStepRef.current[key],
    [],
  )

  const canStart = useCallback(
    (key: string = '_default') => canStartFlagRef.current[key],
    [],
  )

  const start = useCallback(
    async (key: string, fromStep?: number) => {
      const newCurrentStep = fromStep
        ? (stepsRef.current[key] as StepObject)[fromStep]
        : getFirstStep(key)

      if (startTriesRef.current > MAX_START_TRIES) {
        startTriesRef.current = 0
        return
      }
      if (!newCurrentStep) {
        startTriesRef.current += 1
        requestAnimationFrame(() => start(key, fromStep))
      } else {
        eventEmitterRef.current[key]?.emit('start')
        await setCurrentStep(key, newCurrentStep!)
        setVisible(key, true)
        startTriesRef.current = 0
      }
    },
    [getFirstStep, setCurrentStep],
  )
  const next = useCallback(() => _next(tourKey), [_next, tourKey])
  const prev = useCallback(() => _prev(tourKey), [_prev, tourKey])

  // 'stop' need passdown, should make it stable not change.
  const tourKeyRef = useRef(tourKey)
  useEffect(() => {
    tourKeyRef.current = tourKey
  }, [tourKey])
  const stop = useCallback(() => _stop(tourKeyRef.current), [_stop])

  useEffect(() => {
    if (mountedRef.current && visible[tourKey] === false) {
      eventEmitterRef.current[tourKey]?.emit('stop')
    }
  }, [mountedRef, tourKey, visible])

  useEffect(() => {
    if (visible[tourKey] || currentStep[tourKey]) {
      moveToCurrentStep(tourKey)
    }
  }, [visible, currentStep, tourKey, moveToCurrentStep])

  useEffect(() => {
    if (mountedRef.current) {
      if (stepsRef.current[tourKey]) {
        updateCanStartFlag(tourKey)
        if (canStart(tourKey)) {
          if (typeof startAtMount === 'string') {
            start(startAtMount)
          } else if (startAtMount) {
            start('_default')
          }
        }
      }
    }
  }, [canStart, mountedRef, start, startAtMount, tourKey, updateCanStartFlag])

  const isFirstStep = useMemo(() => {
    const obj: Ctx<boolean> = {} as Ctx<boolean>
    Object.keys(currentStep).forEach((key) => {
      obj[key] = currentStep[key] === getFirstStep(key)
    })
    return obj
  }, [currentStep, getFirstStep])

  const isLastStep = useMemo(() => {
    const obj: Ctx<boolean> = {} as Ctx<boolean>
    Object.keys(currentStep).forEach((key) => {
      obj[key] = currentStep[key] === getLastStep(key)
    })
    return obj
  }, [currentStep, getLastStep])

  const containerStyle = useMemo(
    () => StyleSheet.flatten([styles.container, wrapperStyle]),
    [wrapperStyle],
  )

  const getEventEmitter = useCallback(() => eventEmitterRef.current, [])

  const ctx = useMemo(
    () => ({
      canStart,
      getEventEmitter,
      registerStep,
      unregisterStep,
      getCurrentStep,
      start,
      stop,
      setTourKey,
    }),
    [
      canStart,
      getCurrentStep,
      getEventEmitter,
      registerStep,
      start,
      stop,
      unregisterStep,
    ],
  )

  const modalProps = useMemo(
    () => ({
      next,
      prev,
      stop,
      visible: visible[tourKey],
      isFirstStep: isFirstStep[tourKey],
      isLastStep: isLastStep[tourKey],
      currentStep: currentStep[tourKey],
      labels,
      tooltipComponent,
      tooltipStyle,
      androidStatusBarVisible,
      backdropColor,
      animationDuration,
      maskOffset,
      borderRadius,
      dismissOnPress,
    }),
    [
      androidStatusBarVisible,
      animationDuration,
      backdropColor,
      borderRadius,
      currentStep,
      dismissOnPress,
      isFirstStep,
      isLastStep,
      labels,
      maskOffset,
      next,
      prev,
      stop,
      tooltipComponent,
      tooltipStyle,
      tourKey,
      visible,
    ],
  )

  return (
    <View style={containerStyle}>
      <TourGuideContext.Provider value={ctx}>
        {children}
        <Modal ref={modalRef} {...modalProps} />
      </TourGuideContext.Provider>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
