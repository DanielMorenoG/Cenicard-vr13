import React from "react";
import { View } from "react-native";
import Registro from "../Componentes/Registro";

// Registro ya maneja su propio ScrollView y KeyboardAvoidingView internamente
const PageRegistro = ({ navigation }: any) => {
  return (
    <View style={{ flex: 1 }}>
      <Registro navigation={navigation} />
    </View>
  );
};

export default PageRegistro;
