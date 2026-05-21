import { Ionicons } from '@expo/vector-icons';
import { SkeletonNoticiaDestacada, SkeletonNoticiaSmall } from './SkeletonBox';
import React, { useEffect, useState } from 'react';
import {
  Dimensions, Image, Modal,
  RefreshControl, ScrollView, Text,
  TouchableOpacity, View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import styles from '../css/Inicio';

const { width, height } = Dimensions.get('window');

type Noticia = {
  id:          number;
  titulo:      string;
  descripcion: string;
  imagen_url:  string | null;
  created_at:  string;
};

const tiempoRelativo = (fecha: string) => {
  const diff  = Date.now() - new Date(fecha).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)   return 'Ahora';
  if (mins < 60)  return `Hace ${mins} min`;
  const horas = Math.floor(mins / 60);
  if (horas < 24) return `Hace ${horas}h`;
  const dias  = Math.floor(horas / 24);
  return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
};

const ImagenNoticia = ({ uri, style }: { uri: string | null; style: any }) => {
  if (uri) return <Image source={{ uri }} style={style} resizeMode="cover" />;
  return (
    <View style={[style, { backgroundColor: '#C8E6C9', justifyContent: 'center', alignItems: 'center' }]}>
      <Image source={require('../Img/logo_sena.png')} style={{ width: '60%', height: '60%' }} resizeMode="contain" />
    </View>
  );
};

const Inicio = () => {
  const [noticias,    setNoticias]    = useState<Noticia[]>([]);
  const [cargando,    setCargando]    = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [seleccionada, setSeleccionada] = useState<Noticia | null>(null);

  const cargarNoticias = async () => {
    const { data } = await supabase
      .from('noticias')
      .select('id, titulo, descripcion, imagen_url, created_at')
      .eq('publicado', true)
      .order('created_at', { ascending: false });
    setNoticias(data ?? []);
    setCargando(false);
    setRefreshing(false);
  };

  useEffect(() => {
    cargarNoticias();

    const channel = supabase
      .channel('noticias-realtime-' + Date.now())
      .on('postgres_changes' as any,
        { event: '*', schema: 'public', table: 'noticias' },
        () => cargarNoticias()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const onRefresh = () => { setRefreshing(true); cargarNoticias(); };

  if (cargando) {
    return (
      <View style={styles.fondoinicial}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Noticias Recientes</Text>
          <SkeletonNoticiaDestacada />
          <SkeletonNoticiaSmall />
          <SkeletonNoticiaSmall />
          <SkeletonNoticiaSmall />
        </ScrollView>
      </View>
    );
  }

  const destacada = noticias[0] ?? null;
  const resto     = noticias.slice(1);

  return (
    <View style={styles.fondoinicial}>

      {/* ── Lista principal ───────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E7D32']}
            tintColor="#2E7D32"
          />
        }
      >
        <Text style={styles.sectionTitle}>Noticias Recientes</Text>

        {/* Sin noticias */}
        {noticias.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 60, gap: 12 }}>
            <Ionicons name="newspaper-outline" size={52} color="#CCC" />
            <Text style={{ color: '#CCC', fontSize: width * 0.038, textAlign: 'center' }}>
              No hay noticias publicadas aún.{'\n'}Desliza hacia abajo para actualizar.
            </Text>
          </View>
        )}

        {/* ── Noticia destacada ─────────────────────────────────── */}
        {destacada && (
          <TouchableOpacity
            style={styles.cardDestacada}
            activeOpacity={0.88}
            onPress={() => setSeleccionada(destacada)}
          >
            <View style={styles.cardDestacadaImgWrapper}>
              <ImagenNoticia uri={destacada.imagen_url} style={styles.cardDestacadaImg} />
              <View style={styles.badgeCategoria}>
                <Text style={styles.badgeCategoriaText}>DESTACADA</Text>
              </View>
            </View>
            <View style={styles.cardDestacadaBody}>
              <Text style={styles.cardDestacadaTitulo} numberOfLines={2}>
                {destacada.titulo}
              </Text>
              {/* Solo 2 líneas — para ver todo hay que tocar */}
              <Text style={styles.cardDestacadaDesc} numberOfLines={2}>
                {destacada.descripcion}
              </Text>
              <View style={styles.cardDestacadaFooter}>
                <View style={styles.tiempoRow}>
                  <Ionicons name="time-outline" size={13} color="#888" />
                  <Text style={styles.tiempoText}>{tiempoRelativo(destacada.created_at)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.btnLeerMas}
                  onPress={() => setSeleccionada(destacada)}
                >
                  <Text style={styles.btnLeerMasText}>Leer más</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* ── Noticias secundarias ──────────────────────────────── */}
        {resto.map(n => (
          <TouchableOpacity
            key={n.id}
            style={styles.cardSmall}
            activeOpacity={0.88}
            onPress={() => setSeleccionada(n)}
          >
            <ImagenNoticia
              uri={n.imagen_url}
              style={styles.cardSmallImg}
            />
            <View style={styles.cardSmallBody}>
              <Text style={styles.cardSmallTitulo} numberOfLines={2}>
                {n.titulo}
              </Text>
              {/* Solo 2 líneas en la lista */}
              <Text style={styles.cardSmallDesc} numberOfLines={2}>
                {n.descripcion}
              </Text>
              <View style={styles.cardSmallFooter}>
                <Text style={styles.cardSmallCategoria}>Noticias SENA</Text>
                <View style={styles.tiempoRow}>
                  <Ionicons name="time-outline" size={12} color="#888" />
                  <Text style={styles.tiempoText}>{tiempoRelativo(n.created_at)}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Modal detalle de noticia ──────────────────────────── */}
      <Modal
        visible={!!seleccionada}
        animationType="slide"
        transparent
        onRequestClose={() => setSeleccionada(null)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor:      '#fff',
            borderTopLeftRadius:  28,
            borderTopRightRadius: 28,
            maxHeight:            height * 0.88,
            overflow:             'hidden',
          }}>
            {/* Imagen */}
            <View style={{ height: height * 0.28, backgroundColor: '#C8E6C9' }}>
              <ImagenNoticia
                uri={seleccionada?.imagen_url ?? null}
                style={{ width: '100%', height: '100%' }}
              />
              {/* Botón cerrar */}
              <TouchableOpacity
                onPress={() => setSeleccionada(null)}
                style={{
                  position:        'absolute',
                  top:             14,
                  right:           14,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  borderRadius:    20,
                  width:           36,
                  height:          36,
                  justifyContent:  'center',
                  alignItems:      'center',
                }}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
              {/* Badge */}
              <View style={{
                position:          'absolute',
                bottom:            12,
                left:              16,
                backgroundColor:   '#007832',
                borderRadius:      6,
                paddingHorizontal: 10,
                paddingVertical:   4,
              }}>
                <Text style={{ color: '#fff', fontSize: width * 0.025, fontWeight: '700' }}>
                  SENA CENIGRAF
                </Text>
              </View>
            </View>

            {/* Contenido scrollable */}
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: width * 0.06,
                paddingTop:        20,
                paddingBottom:     40,
              }}
              showsVerticalScrollIndicator={false}
            >
              {/* Tiempo */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                <Ionicons name="time-outline" size={14} color="#888" />
                <Text style={{ color: '#888', fontSize: width * 0.030 }}>
                  {seleccionada ? tiempoRelativo(seleccionada.created_at) : ''}
                </Text>
              </View>

              {/* Título completo */}
              <Text style={{
                fontSize:     width * 0.052,
                fontWeight:   '800',
                color:        '#1A1A1A',
                lineHeight:   width * 0.066,
                marginBottom: 14,
              }}>
                {seleccionada?.titulo}
              </Text>

              {/* Separador verde */}
              <View style={{ height: 3, backgroundColor: '#2E7D32', borderRadius: 2, marginBottom: 16, width: 48 }} />

              {/* Descripción completa */}
              <Text style={{
                fontSize:   width * 0.038,
                color:      '#444',
                lineHeight: width * 0.060,
              }}>
                {seleccionada?.descripcion}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default Inicio;