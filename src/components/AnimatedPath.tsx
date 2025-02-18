import * as React from 'react'
import { Animated, Platform } from 'react-native'
import { Path, PathProps } from 'react-native-svg'

export const AnimatedSvgPath: React.ComponentType<PathProps> = Platform.select({
  default: Animated.createAnimatedComponent(Path) as any,
  web: Path,
})
