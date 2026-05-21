import { Dimensions, StyleSheet } from 'react-native';
import { F } from '../lib/fonts';

const { width, height } = Dimensions.get('window');
// Altura dinámica — el carné crece según el contenido
const FOTO_W = width * 0.38;
const FOTO_H = FOTO_W * 1.33;

const styles = StyleSheet.create({

  fondoinicial: { flex: 1, backgroundColor: '#F4F4F4' },
  scroll:       { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.035,
    paddingTop: 12,
    paddingBottom: 32,
  },

  flipWrapper: { minHeight: height * 0.60 },

  // ── Carnet base ───────────────────────────────────────────
  carnetCard: {
    minHeight: height * 0.60,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: width * 0.04,
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 5,
  },

  carnetAtras: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    minHeight: height * 0.60,
  },

  carnetBloqueado: { borderColor: '#FFCDD2' },

  // ── Frente ────────────────────────────────────────────────
  fotoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  logoCarnet: {
    width: width * 0.30,
    height: width * 0.30,
    resizeMode: 'contain',
  },

  fotoPlaceholder: {
    width: FOTO_W,
    height: FOTO_H,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  fotoText: { color: '#999', fontSize: 12, fontWeight: '600' },

  fechaVigencia: {
    position: 'absolute',
    top: 0, left: 0,
    backgroundColor: '#bbc3cc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },

  fechaVigenciaText: {
    fontFamily: F.bold,
    color: '#1A1A1A',
    fontSize: Math.round(width * 0.035),
  },

  rolLabel: {
    fontFamily: F.black,
    fontSize: Math.round(width * 0.033),
    color: '#555',
    letterSpacing: 1.5,
    marginBottom: 6,
    marginTop: 4,
  },

  separador: {
    height: 3,
    backgroundColor: '#2E7D32',
    marginBottom: 10,
    borderRadius: 2,
  },

  nombreCompleto: {
    fontFamily: F.extrabold,
    fontSize: Math.round(width * 0.058),
    color: '#2E7D32',
    marginBottom: 8,
    lineHeight: Math.round(width * 0.065),
    flexShrink: 1,
  },

  campo: {
    fontFamily: F.regular,
    fontSize: Math.round(width * 0.048),
    color: '#333',
    marginBottom: 5,
  },

  fechaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 8,
  },

  fechaBadge: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  fechaBadgeText: {
    fontFamily: F.bold,
    color: '#fff',
    fontSize: Math.round(width * 0.033),
  },

  separadorDelgado: {
    height: 2,
    backgroundColor: '#2E7D32',
    marginBottom: 10,
    marginTop: 8,
    borderRadius: 2,
  },

  regional: {
    fontFamily: F.regular,
    fontSize: Math.round(width * 0.042),
    color: '#555',
    marginBottom: 4,
  },

  centro: {
    fontFamily: F.bold,
    fontSize: Math.round(width * 0.040),
    color: '#2E7D32',
    flexShrink: 1,
  },

  // ── Bloqueado / Préstamo ──────────────────────────────────
  bloqueadoWrapper: { flex: 1, alignItems: 'center' },

  alertaBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FFCCBC',
  },

  alertaIconWrapper: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
  },

  alertaTitulo: {
    fontFamily: F.extrabold,
    fontSize: Math.round(width * 0.05), color: '#1A1A1A',
    textAlign: 'center', marginBottom: 12,
  },

  estadoBadgePrestamo: {
    backgroundColor: '#FFA726',
    borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 6,
    marginBottom: 12,
  },

  estadoBadgeVencido: {
    backgroundColor: '#B71C1C',
    borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 6,
    marginBottom: 12,
  },

  estadoBadgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  alertaDesc: {
    fontSize: 12, color: '#666',
    textAlign: 'center', lineHeight: 18,
  },

  // ── Botón estado ──────────────────────────────────────────
  // ── Botón estado ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  btnEstado: {
    flexDirection:   'row',
    alignItems:      'center',
    borderWidth:     1.5,
    borderColor:     '#2E7D32',
    borderRadius:    24,
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignSelf:       'center',
    marginTop:       12,
    marginBottom:    8,
  },

  btnEstadoText: { fontWeight: '700', fontSize: 13 },

  // ── Reverso ───────────────────────────────────────────────
  infoTitle: {
    fontFamily: F.extrabold,
    fontSize: Math.round(width * 0.050), color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 10, lineHeight: Math.round(width * 0.060),
  },

  infoRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#e5eee4a2',
    borderRadius: 12, padding: 8,
    marginBottom: 6, gap: 8,
  },

  infoIconWrapper: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },

  infoTextos: { flex: 1 },

  infoLabel: {
    fontFamily: F.bold,
    fontSize: 9, color: '#999', letterSpacing: 0.4, marginBottom: 1,
  },

  infoValor: {
    fontFamily: F.regular,
    fontSize: Math.round(width * 0.032),
    color: '#1A1A1A', lineHeight: 18, flexShrink: 1,
  },

  // ── Modales ───────────────────────────────────────────────
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36,
  },

  modalTitle: {
    fontFamily: F.extrabold,
    fontSize: 20, color: '#1A1A1A', marginBottom: 6,
  },

  modalSubtitle: { fontFamily: F.regular, fontSize: 13, color: '#666', marginBottom: 16 },

  modalInput: {
    fontFamily: F.regular,
    backgroundColor: '#c8e6c99a',
    borderRadius: 30,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 14, color: '#333', marginBottom: 12,
  },

  modalBtn: {
    backgroundColor: '#2D6A2D',
    borderRadius: 30, paddingVertical: 14,
    alignItems: 'center', marginBottom: 12,
  },

  modalBtnText: {
    fontFamily: F.bold,
    color: '#fff',
    fontSize: 14, letterSpacing: 1.2,
  },

  modalCancelar: {
    fontFamily: F.medium,
    textAlign: 'center', color: '#999', fontSize: 14, paddingTop: 4,
  },
});

export default styles;