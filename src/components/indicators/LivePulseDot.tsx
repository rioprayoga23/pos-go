import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet, View } from 'react-native';
import { colors } from '../../theme';

type Props = {
  active: boolean;
  dotSize?: 7 | 8;
};

export function LivePulseDot({ active, dotSize = 8 }: Props) {
  const [pulse] = useState(() => new Animated.Value(0));
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotionEnabled,
    );

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) setReduceMotionEnabled(enabled);
      })
      .catch(() => {
        if (isMounted) setReduceMotionEnabled(false);
      });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  const shouldPulse = active && !reduceMotionEnabled;

  useEffect(() => {
    if (!shouldPulse) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }

    const useNativeDriver = Platform.OS !== 'web';
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, isInteraction: false, useNativeDriver }),
        Animated.timing(pulse, { toValue: 0, duration: 900, isInteraction: false, useNativeDriver }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [pulse, shouldPulse]);

  return (
    <View style={styles.wrap}>
      {shouldPulse && (
        <Animated.View
          style={[
            styles.halo,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.38, 0] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.15] }) }],
            },
          ]}
        />
      )}
      <View style={[styles.core, { width: dotSize, height: dotSize, borderRadius: dotSize }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', backgroundColor: colors.success },
  core: { backgroundColor: colors.success },
});
