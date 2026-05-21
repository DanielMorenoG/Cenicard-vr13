import React from 'react';
import { View } from 'react-native';
import Barranav from '../Componentes/Barranav';
import Barrasup from '../Componentes/Barrasup';
import Inicio from '../Componentes/Inicio';

const PageInicio = ({ navigation }: any) => {
  return (
    <View style={{ flex: 1,  }}>
      <Barrasup />
      <Inicio />
      <Barranav navigation={navigation} />
    </View>
  );
};

export default PageInicio;