import * as React from 'react'
import { BorderRadiusObject, Shape } from '../types'
import { ITourGuideContext } from './TourGuideContext'

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

  const register = React.useCallback(() => {
    if (context && context.registerStep) {
      context.registerStep(tourKey, {
        target: null,
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

  const copilot = {
    ref: wrapperRef,
    onLayout: () => {}, // Android hack
  }

  return React.cloneElement(children, { copilot })
}
