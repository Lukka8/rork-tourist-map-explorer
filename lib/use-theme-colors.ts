import { useMemo } from 'react';
import { useTheme } from './theme-context';
import { Colors, Theme } from '@/constants/colors';

export function useThemeColors(): Theme {
  const { isDark } = useTheme();
  return useMemo(() => isDark ? Colors.dark : Colors.light, [isDark]);
}
