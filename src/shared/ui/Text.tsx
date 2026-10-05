import { StyleSheet, Text as RNText, type TextProps } from 'react-native';

const SANS_BY_WEIGHT: Record<string, string> = {
  '400': 'DMSans_400Regular',
  '500': 'DMSans_500Medium',
  '600': 'DMSans_600SemiBold',
  '700': 'DMSans_700Bold',
};

/**
 * Custom fonts ship one file per weight, and React Native will not pick the file from
 * `fontWeight`. This resolves the weight to the right DM Sans family and clears
 * `fontWeight` so the platform does not fake a bold on top of it.
 */
export function Text({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  const isSerif = flat.fontFamily?.startsWith('DMSerif');
  const weight = String(flat.fontWeight ?? '400');
  const fontFamily = isSerif ? flat.fontFamily : (SANS_BY_WEIGHT[weight] ?? SANS_BY_WEIGHT['400']);

  return <RNText {...props} style={[flat, { fontFamily, fontWeight: 'normal' }]} />;
}
