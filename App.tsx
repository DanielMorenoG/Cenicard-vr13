import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { FONTS } from "./src/lib/fonts";
import Navegacion from "./src/Navigation/Navegacion";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts(FONTS);
  const [splashHidden, setSplashHidden] = useState(false);

  useEffect(() => {
    if ((fontsLoaded || fontError) && !splashHidden) {
      SplashScreen.hideAsync()
        .then(() => setSplashHidden(true))
        .catch(() => setSplashHidden(true));
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navegacion />
      </AuthProvider>
    </SafeAreaProvider>
  );
}