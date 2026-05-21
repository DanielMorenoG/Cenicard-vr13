import React from 'react';
import { View } from 'react-native';
import Barranav from '../Componentes/Barranav';
import Barrasup from '../Componentes/Barrasup';
import Servicios from '../Componentes/Servicios';

const PageServicios = ({ navigation }: any) => {
  return (
    <View style={{ flex: 1, backgroundColor: '#F4F4F4' }}>
      <Barrasup />
      <Servicios/>
      <Barranav navigation={navigation} />
    </View>
  );
};

export default PageServicios;