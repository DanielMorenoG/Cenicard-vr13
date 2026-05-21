import React from 'react';
import { View } from 'react-native';
import Barranav from '../Componentes/Barranav';
import Barrasup from '../Componentes/Barrasup';
import Carnet from '../Componentes/Carnet';

const PageCarnet = ({ navigation }: any) => {
  return (
    <View style={{ flex: 1, backgroundColor: '#F4F4F4' }}>
      <Barrasup />
      <Carnet />
      <Barranav navigation={navigation} />
    </View>
  );
};

export default PageCarnet;