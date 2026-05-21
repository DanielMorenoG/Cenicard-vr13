import React from 'react';
import { View } from 'react-native';
import Barranav from '../Componentes/Barranav';
import Barrasup from '../Componentes/Barrasup';
import Notificaciones from '../Componentes/Notificaciones';

const PageNotificaciones = ({ navigation }: any) => {
  return (
    <View style={{ flex: 1, backgroundColor: '#F4F4F4' }}>
      <Barrasup />
      <Notificaciones />
      <Barranav navigation={navigation} />
    </View>
  );
};

export default PageNotificaciones;