import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  safeArea: {
    backgroundColor: '#007832',
  },

  container: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   '#007832',
    paddingHorizontal: width * 0.04,
    paddingVertical:   10,
  },

  left: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
    flex:          1,
  },

  iconWrapper: {
    width:           40,
    height:          40,
    borderRadius:    10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems:      'center',
    justifyContent:  'center',
  },

  titleBlock: {
    flexDirection: 'column',
    flex:          1,
  },

  title: {
    fontSize:   width * 0.040,
    color:      '#fff',
    fontWeight: '700',
  },

  subtitle: {
    fontSize:      width * 0.026,
    color:         'rgba(255,255,255,0.75)',
    letterSpacing: 0.5,
  },
});