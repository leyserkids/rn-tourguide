import React, { useCallback, useMemo } from 'react'
import { Emitter, TourGuideContext } from '../components/TourGuideContext'
import { TourGuideZone, TourGuideZoneProps } from '../components/TourGuideZone'
import {
  TourGuideZoneByPosition,
  TourGuideZoneByPositionProps,
} from '../components/TourGuideZoneByPosition'

type GetEventEmitter = () => Emitter

export const useTourGuideController = (tourKey?: string) => {
  const { start, canStart, stop, getEventEmitter, getCurrentStep, setTourKey } =
    React.useContext(TourGuideContext)

  let key = tourKey ?? '_default'

  const _start = useCallback(
    (fromStep?: number) => {
      setTourKey && setTourKey(key)
      if (start) {
        start(key, fromStep)
      }
    },
    [key, setTourKey, start],
  )

  const _stop = useCallback(() => {
    if (stop) {
      stop(key)
    }
  }, [key, stop])

  const _getCurrentStep = useCallback(() => {
    if (getCurrentStep) {
      return getCurrentStep(key)
    }
    return undefined
  }, [getCurrentStep, key])

  const KeyedTourGuideZone: React.FC<Omit<TourGuideZoneProps, 'tourKey'>> =
    useCallback(
      ({ children, ...rest }) => {
        return (
          <TourGuideZone {...rest} tourKey={key}>
            {children}
          </TourGuideZone>
        )
      },
      [key],
    )

  const KeyedTourGuideZoneByPosition: React.FC<
    Omit<TourGuideZoneByPositionProps, 'tourKey'>
  > = React.useCallback(
    (props) => {
      return <TourGuideZoneByPosition {...props} tourKey={key} />
    },
    [key],
  )

  const _getEventEmitter = useMemo<GetEventEmitter | undefined>(() => {
    const eventEmitter = getEventEmitter ? getEventEmitter() : undefined
    return eventEmitter ? () => eventEmitter[key] : undefined
  }, [getEventEmitter, key])

  const _canStart = useCallback(() => canStart(key), [canStart, key])

  React.useEffect(() => {
    setTourKey && setTourKey(key)
  }, [key, setTourKey])

  return useMemo(
    () => ({
      start: _start,
      stop: _stop,
      getEventEmitter: _getEventEmitter,
      getCurrentStep: _getCurrentStep,
      canStart: _canStart,
      TourGuideZone: KeyedTourGuideZone,
      TourGuideZoneByPosition: KeyedTourGuideZoneByPosition,
    }),
    [
      KeyedTourGuideZone,
      KeyedTourGuideZoneByPosition,
      _canStart,
      _getCurrentStep,
      _getEventEmitter,
      _start,
      _stop,
    ],
  )
}
