import {
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
    WorkSans_800ExtraBold,
    WorkSans_900Black,
} from "@expo-google-fonts/work-sans";

// Objeto para pasar a useFonts() en App.tsx
export const FONTS = {
  WorkSans_400Regular,
  WorkSans_500Medium,
  WorkSans_600SemiBold,
  WorkSans_700Bold,
  WorkSans_800ExtraBold,
  WorkSans_900Black,
};

// Nombres de fuente para usar en fontFamily
export const F = {
  regular: "WorkSans_400Regular",
  medium: "WorkSans_500Medium",
  semibold: "WorkSans_600SemiBold",
  bold: "WorkSans_700Bold",
  extrabold: "WorkSans_800ExtraBold",
  black: "WorkSans_900Black",
} as const;
