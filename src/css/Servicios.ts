import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const cardW = (width - width * 0.12 - 12) / 2;

export default StyleSheet.create({

  fondoinicial:  { flex: 1, backgroundColor: '#F4F4F4' },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: width * 0.045, paddingTop: 16, paddingBottom: 24 },

  headerRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   20,
  },

  pageTitle: {
    fontSize:   width * 0.062,
    fontWeight: '800',
    color:      '#1A1A1A',
  },

  pageSubtitle: {
    fontSize:  width * 0.036,
    color:     '#666',
    marginTop: 6,
  },

  categoriasRow: {
    flexDirection:  'row',
    justifyContent: 'space-around',
    marginBottom:   20,
    flexWrap:       'wrap',
    gap:            8,
  },

  categoriaItem:  { alignItems: 'center', gap: 6 },

  categoriaImgWrapper: {
    width:           width * 0.18,
    height:          width * 0.18,
    borderRadius:    14,
    backgroundColor: '#E8F5E9',
    borderWidth:     2,
    borderColor:     'transparent',
    alignItems:      'center',
    justifyContent:  'center',
  },

  categoriaImgWrapperActive: { borderColor: '#2E7D32' },

  categoriaLabel: {
    fontSize: width * 0.028,
    color:    '#666',
    fontWeight: '500',
  },

  categoriaLabelActive: {
    fontWeight: '700',
    color:      '#2E7D32',
  },

  btnPrestamos: {
    backgroundColor:   '#2E7D32',
    borderRadius:      20,
    paddingHorizontal: 20,
    paddingVertical:   10,
    alignSelf:         'center',
    marginBottom:      16,
  },

  btnPrestamosText: {
    fontWeight: '700',
    color:      '#fff',
    fontSize:   width * 0.034,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  equipoCard: {
    width:           cardW,
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         12,
    alignItems:      'center',
    elevation:       2,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.06,
    shadowRadius:    4,
  },

  estadoBadge: {
    borderRadius:      10,
    paddingHorizontal: 8,
    paddingVertical:   3,
    marginBottom:      8,
    alignSelf:         'flex-end',
  },

  estadoText: {
    fontWeight: '700',
    color:      '#fff',
    fontSize:   width * 0.022,
  },

  equipoImgPlaceholder: {
    width:           '100%',
    height:          width * 0.22,
    backgroundColor: '#E8F5E9',
    borderRadius:    10,
    marginBottom:    8,
  },

  equipoNumero: {
    fontSize:     width * 0.056,
    fontWeight:   '800',
    color:        '#1A1A1A',
    marginBottom: 8,
  },

  btnSolicitar: {
    borderWidth:       1.5,
    borderColor:       '#C8E6C9',
    borderRadius:      20,
    paddingHorizontal: 16,
    paddingVertical:   6,
    marginBottom:      4,
  },

  btnSolicitarText: {
    fontSize:   width * 0.030,
    color:      '#2E7D32',
    fontWeight: '600',
  },

  modalOverlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent:  'flex-end',
  },

  modalCard: {
    backgroundColor:      '#fff',
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    padding:              24,
    paddingBottom:        40,
  },

  modalTitle: {
    fontSize:     width * 0.050,
    fontWeight:   '800',
    color:        '#1A1A1A',
    marginBottom: 6,
  },

  modalSubtitle: {
    fontSize:     width * 0.034,
    color:        '#666',
    marginBottom: 16,
  },

  modalInput: {
    backgroundColor:   '#c8e6c99a',
    borderRadius:      30,
    paddingHorizontal: 16,
    paddingVertical:   width * 0.034,
    fontSize:          width * 0.036,
    color:             '#333',
    marginBottom:      14,
  },

  modalBtn: {
    backgroundColor: '#2D6A2D',
    borderRadius:    30,
    paddingVertical: 14,
    alignItems:      'center',
    marginBottom:    12,
  },

  modalBtnText: {
    fontWeight:    '700',
    color:         '#fff',
    fontSize:      width * 0.036,
    letterSpacing: 1.5,
  },

  modalCancelar: {
    textAlign:  'center',
    color:      '#999',
    fontSize:   width * 0.036,
    paddingTop: 4,
  },

  prestamosEmpty: { paddingVertical: 30, alignItems: 'center' },

  prestamosEmptyText: {
    color:    '#999',
    fontSize: width * 0.036,
  },
});