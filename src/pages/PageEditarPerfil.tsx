import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import EditarPerfil from "../Componentes/EditarPerfil";

const PageEditarPerfil = ({ navigation }: any) => {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <EditarPerfil navigation={navigation} />
    </KeyboardAvoidingView>
  );
};

export default PageEditarPerfil;
