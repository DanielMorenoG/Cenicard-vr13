import { Dimensions, StyleSheet } from "react-native";
import { F } from "../lib/fonts";

const { width, height } = Dimensions.get("window");

// ── Cálculo responsivo de cajas OTP ──────────────────────────────
// 8 cajas + 7 gaps de 6 px, respetando el padding horizontal del contenedor
const OTP_DIGITS        = 8;
const OTP_GAP           = 6;
const CONTAINER_PADDING = width * 0.07 * 2;
const OTP_BOX_SIZE      = Math.floor(
  (width - CONTAINER_PADDING - OTP_GAP * (OTP_DIGITS - 1)) / OTP_DIGITS
);

const styles = StyleSheet.create({
  fondoinicial: { flex: 1, backgroundColor: "#007832" },

  containerfondo: {
    height: height * 0.32,
    backgroundColor: "#007832",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  chicaimg: {
    width: "68%",
    height: height * 0.27,
    resizeMode: "contain",
    right: 10,
  },

  logoimg: {
    position: "absolute",
    top: 24,
    right: 16,
    width: width * 0.18,
    height: width * 0.22,
    resizeMode: "contain",
  },

  LoginContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 36,
    paddingHorizontal: width * 0.07,
    paddingTop: 32,
    paddingBottom: 40,
  },

  title: {
    fontFamily: F.black,
    fontSize: width * 0.1,
    color: "#2E2E2E",
    textAlign: "center",
    lineHeight: width * 0.11,
    marginBottom: 16,
  },

  subtitle: {
    fontFamily: F.regular,
    fontSize: width * 0.042,
    color: "#666",
    textAlign: "center",
    lineHeight: width * 0.058,
    marginBottom: 8,
  },

  subtitle2: {
    fontFamily: F.regular,
    fontSize: width * 0.04,
    color: "#666",
    textAlign: "center",
    lineHeight: width * 0.056,
    marginBottom: 20,
  },

  inputLabel: {
    fontFamily: F.bold,
    fontSize: width * 0.04,
    color: "#007832",
    textAlign: "center",
    marginBottom: 10,
  },

  input: {
    fontFamily: F.regular,
    backgroundColor: "#c8e6c99a",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: width * 0.034,
    fontSize: width * 0.038,
    color: "#1A1A1A",
    marginBottom: 24,
  },

  button: {
    backgroundColor: "#2D6A2D",
    borderRadius: 30,
    paddingVertical: width * 0.042,
    marginHorizontal: width * 0.12,
    alignItems: "center",
    shadowColor: "#2D6A2D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },

  buttonText: {
    fontFamily: F.bold,
    color: "#FFFFFF",
    fontSize: width * 0.038,
    letterSpacing: 2,
  },

  // ── OTP ──────────────────────────────────────────────────────
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // distribuye uniformemente sin overflow
    alignItems: "center",
    marginBottom: 16,
    // sin gap fijo: space-between lo maneja
  },

  otpBox: {
    // width y height se asignan inline desde el componente (OTP_BOX_SIZE)
    borderRadius: 10,
    backgroundColor: "#c8e6c99a",
    textAlign: "center",
    fontWeight: "800",
    color: "#1A1A1A",
  },

  // ── Aviso ────────────────────────────────────────────────────
  aviso: {
    backgroundColor: "#fff8e1",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#F57F17",
  },

  avisoText: {
    fontSize: width * 0.031,
    color: "#6D4C00",
    lineHeight: 18,
  },
});

export default styles;