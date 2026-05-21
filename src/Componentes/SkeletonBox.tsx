import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View, ViewStyle } from 'react-native';

const { width } = Dimensions.get('window');

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonBox = ({ width: w = '100%', height: h = 16, borderRadius = 8, style }: SkeletonBoxProps) => {
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        { width: w as any, height: h, borderRadius, backgroundColor: '#E0E0E0', opacity: anim },
        style,
      ]}
    />
  );
};

// ── Skeleton para notificaciones ─────────────────────────────────────────────
export const SkeletonNotifCard = () => (
  <View style={sk.card}>
    <SkeletonBox width={44} height={44} borderRadius={12} />
    <View style={{ flex: 1, gap: 8 }}>
      <SkeletonBox width="70%" height={14} />
      <SkeletonBox width="40%" height={11} />
    </View>
  </View>
);

// ── Skeleton para noticias destacadas ────────────────────────────────────────
export const SkeletonNoticiaDestacada = () => (
  <View style={[sk.card, { flexDirection: 'column', padding: 0, overflow: 'hidden', marginBottom: 14 }]}>
    <SkeletonBox width="100%" height={width * 0.50} borderRadius={0} />
    <View style={{ padding: width * 0.042, gap: 10 }}>
      <SkeletonBox width="85%" height={18} />
      <SkeletonBox width="60%" height={18} />
      <SkeletonBox width="100%" height={13} />
      <SkeletonBox width="75%" height={13} />
    </View>
  </View>
);

// ── Skeleton para noticias pequeñas ──────────────────────────────────────────
export const SkeletonNoticiaSmall = () => (
  <View style={[sk.card, { marginBottom: 10 }]}>
    <SkeletonBox width={width * 0.26} height={width * 0.26} borderRadius={12} />
    <View style={{ flex: 1, padding: 12, gap: 8 }}>
      <SkeletonBox width="80%" height={14} />
      <SkeletonBox width="90%" height={12} />
      <SkeletonBox width="60%" height={12} />
    </View>
  </View>
);

// ── Skeleton para equipos (grid 2 col) ───────────────────────────────────────
const cardW = (width - width * 0.12 - 12) / 2;
export const SkeletonEquipoCard = () => (
  <View style={[sk.equipoCard, { width: cardW }]}>
    <SkeletonBox width="100%" height={cardW * 0.85} borderRadius={10} />
    <View style={{ gap: 8, marginTop: 10 }}>
      <SkeletonBox width="50%" height={13} style={{ alignSelf: 'center' }} />
      <SkeletonBox width="80%" height={30} borderRadius={10} style={{ alignSelf: 'center' }} />
      <SkeletonBox width="80%" height={30} borderRadius={10} style={{ alignSelf: 'center' }} />
    </View>
  </View>
);

const sk = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 14,
    marginBottom: 10,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  equipoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
});