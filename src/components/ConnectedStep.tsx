import * as React from 'react'
import { BorderRadiusObject, Shape } from '../types'
import { ITourGuideContext } from './TourGuideContext'

declare var __TEST__: boolean

interface Props {
  name: string
  text: string
  order: number
  tourKey: string
  active?: boolean
  moveIntoView?: () => void | Promise<void>
  shape?: Shape
  context: ITourGuideContext
  children?: any
  maskOffset?: number
  borderRadiusObject?: BorderRadiusObject
  borderRadius?: number
  keepTooltipPosition?: boolean
  tooltipBottomOffset?: number
}

export const ConnectedStep: React.FC<Props> = ({
  active = true,
  children,
  context,
  tourKey,
  name,
  borderRadius,
  ...otherProps
}) => {
  const wrapperRef = React.useRef<any>(null)
  const componentRef = React.useRef<any>({})

  const measure = React.useCallback(() => {
    if (typeof __TEST__ !== 'undefined' && __TEST__) {
      return new Promise((resolve) =>
        resolve({
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        }),
      )
    }

    return new Promise((resolve, reject) => {
      const measureFn = () => {
        // Wait until the wrapper element appears
        if (wrapperRef.current && wrapperRef.current.measure) {
          wrapperRef.current.measure(
            (
              _ox: number,
              _oy: number,
              width: number,
              height: number,
              x: number,
              y: number,
            ) =>
              resolve({
                x: borderRadius ? x + borderRadius : x,
                y,
                width: borderRadius ? width - borderRadius * 2 : width,
                height,
              }),
            reject,
          )
        } else {
          requestAnimationFrame(measureFn)
        }
      }
      requestAnimationFrame(measureFn)
    })
  }, [borderRadius])

  // 将 measure 方法添加到 componentRef 中
  React.useEffect(() => {
    componentRef.current.measure = measure
  }, [measure])

  const register = React.useCallback(() => {
    if (context && context.registerStep) {
      context.registerStep(tourKey, {
        target: componentRef.current,
        wrapper: wrapperRef.current,
        name,
        borderRadius,
        ...otherProps,
      })
    } else {
      console.warn('context undefined')
    }
  }, [context, tourKey, name, borderRadius, otherProps])

  const unregister = React.useCallback(() => {
    if (context && context.unregisterStep) {
      context.unregisterStep(tourKey, name)
    } else {
      console.warn('unregisterStep undefined')
    }
  }, [context, tourKey, name])

  React.useEffect(() => {
    if (active) {
      register()
    }
    return () => {
      unregister()
    }
  }, [active, register, unregister])

  const copilot = React.useMemo(
    () => ({
      ref: (wrapper: any) => {
        wrapperRef.current = wrapper
      },
      onLayout: () => {}, // Android hack
    }),
    [],
  )

  return React.cloneElement(children, { copilot })
}
