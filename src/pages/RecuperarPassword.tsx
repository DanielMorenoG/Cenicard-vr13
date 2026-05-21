import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import RecuperarPasswordComp from '../Componentes/RecuperarPassword';

const PageRecuperarPassword = ({ navigation }: any) => {
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <RecuperarPasswordComp navigation={navigation} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PageRecuperarPassword;
