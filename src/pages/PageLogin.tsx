import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Login from '../Componentes/Login';

const PageLogin = () => {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Login />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PageLogin;