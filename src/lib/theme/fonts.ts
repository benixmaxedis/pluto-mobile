import { Michroma_400Regular } from '@expo-google-fonts/michroma';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';

/**
 * Plus Jakarta Sans — UI body / controls.
 * Michroma — display / large headings (single weight 400).
 */
export function useAppFonts() {
  return useFonts({
    Michroma_400Regular,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
  });
}
