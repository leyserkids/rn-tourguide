import React, { useCallback, useMemo } from 'react'
import { TourGuideContext } from '../components/TourGuideContext'
import { TourGuideZone, TourGuideZoneProps } from '../components/TourGuideZone'
import {
  TourGuideZoneByPosition,
  TourGuideZoneByPositionProps,
} from '../components/TourGuideZoneByPosition'

export const useTourGuideController = (tourKey?: string) => {
  const { start, canStart, stop, eventEmitter, getCurrentStep, setTourKey } =
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

  React.useEffect(() => {
    setTourKey && setTourKey(key)
  }, [key, setTourKey])

  return useMemo(
    () => ({
      start: _start,
      stop: _stop,
      eventEmitter: eventEmitter ? eventEmitter[key] : undefined,
      getCurrentStep: _getCurrentStep,
      canStart: canStart ? canStart[key] : undefined,
      tourKey: key,
      TourGuideZone: KeyedTourGuideZone,
      TourGuideZoneByPosition: KeyedTourGuideZoneByPosition,
    }),
    [
      KeyedTourGuideZone,
      KeyedTourGuideZoneByPosition,
      _getCurrentStep,
      _start,
      _stop,
      canStart,
      eventEmitter,
      key,
    ],
  )
}
