import { Michroma_400Regular } from '@expo-google-fonts/michroma';
import { useFonts } from 'expo-font';

/**
 * General Sans — UI body / controls (400 / 500 / 600 from Fontshare CDN assets).
 * Michroma — display numerals on Now date panel (day, month, session times) only.
 */
export function useAppFonts() {
  return useFonts({
    Michroma_400Regular,
    GeneralSans_400Regular: require('../../../assets/fonts/GeneralSans_400Regular.ttf'),
    GeneralSans_500Medium: require('../../../assets/fonts/GeneralSans_500Medium.ttf'),
    GeneralSans_600Semibold: require('../../../assets/fonts/GeneralSans_600Semibold.ttf'),
  });
}
