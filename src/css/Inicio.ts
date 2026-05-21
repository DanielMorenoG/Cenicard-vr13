import { Dimensions, StyleSheet } from 'react-native';
import { F } from '../lib/fonts';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({

  fondoinicial:  { flex: 1, backgroundColor: '#F4F4F4' },
  scroll:        { flex: 1 },
  scrollContent: {
    paddingHorizontal: width * 0.045,
    paddingTop:        20,
    paddingBottom:     24,
  },

  // ── Título sección ───────────────────────────────────────
  sectionTitle: {
    fontFamily:        F.black,
    fontSize:          width * 0.058,
    color:             '#1A1A1A',
    marginBottom:      16,
    borderBottomWidth: 2.5,
    borderBottomColor: '#2E7D32',
    paddingBottom:     8,
  },

  // ── Noticia destacada ────────────────────────────────────
  cardDestacada: {
    backgroundColor: '#fff',
    borderRadius:    18,
    overflow:        'hidden',
    marginBottom:    14,
    elevation:       3,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.09,
    shadowRadius:    6,
  },

  cardDestacadaImgWrapper: {
    height:          width * 0.50,
    backgroundColor: '#C8E6C9',
    overflow:        'hidden',
  },

  cardDestacadaImg: { width: '100%', height: '100%' },

  badgeCategoria: {
    position:          'absolute',
    bottom:            10,
    left:              12,
    backgroundColor:   '#007832',
    borderRadius:      6,
    paddingHorizontal: 10,
    paddingVertical:   4,
  },

  badgeCategoriaText: {
    fontFamily:    F.bold,
    color:         '#fff',
    fontSize:      width * 0.025,
    letterSpacing: 0.8,
  },

  cardDestacadaBody: {
    padding: width * 0.042,
  },

  cardDestacadaTitulo: {
    fontFamily:   F.extrabold,
    fontSize:     width * 0.044,
    color:        '#1A1A1A',
    marginBottom: 6,
    lineHeight:   width * 0.056,
  },

  cardDestacadaDesc: {
    fontFamily:   F.regular,
    fontSize:     width * 0.034,
    color:        '#555',
    lineHeight:   width * 0.052,
    marginBottom: 12,
  },

  cardDestacadaFooter: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },

  btnLeerMas: {
    backgroundColor:   '#2D6A2D',
    borderRadius:      20,
    paddingHorizontal: 16,
    paddingVertical:   7,
    shadowColor:       '#2D6A2D',
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.25,
    shadowRadius:      4,
    elevation:         3,
  },

  btnLeerMasText: {
    fontFamily: F.bold,
    color:      '#fff',
    fontSize:   width * 0.032,
  },

  // ── Noticias pequeñas ────────────────────────────────────
  cardSmall: {
    backgroundColor: '#fff',
    borderRadius:    16,
    flexDirection:   'row',
    marginBottom:    10,
    overflow:        'hidden',
    elevation:       2,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.06,
    shadowRadius:    4,
  },

  cardSmallImg: {
    width:           width * 0.26,
    height:          width * 0.26,
    backgroundColor: '#C8E6C9',
  },

  cardSmallBody: {
    flex:           1,
    padding:        12,
    justifyContent: 'space-between',
  },

  cardSmallTitulo: {
    fontFamily:   F.bold,
    fontSize:     width * 0.038,
    color:        '#1A1A1A',
    marginBottom: 4,
    lineHeight:   width * 0.050,
  },

  cardSmallDesc: {
    fontFamily: F.regular,
    fontSize:   width * 0.030,
    color:      '#666',
    lineHeight: width * 0.044,
    marginBottom: 6,
  },

  cardSmallFooter: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },

  cardSmallCategoria: {
    fontFamily: F.semibold,
    fontSize:   width * 0.026,
    color:      '#007832',
  },

  tiempoRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  tiempoText: {
    fontFamily: F.regular,
    fontSize:   width * 0.027,
    color:      '#888',
  },
});

export default styles;