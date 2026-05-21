import { Dimensions, StyleSheet } from "react-native";
import { F } from "../lib/fonts";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  fondoinicial: {
    flex: 1,
    backgroundColor: "#007832",
  },

  containerfondo: {
    height: 200,
    backgroundColor: "#007832",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  chicaimg: {
    width: "68%",
    height: 180,
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
    paddingHorizontal: width * 0.06,
    paddingTop: 28,
    paddingBottom: 40,
  },

  title: {
    fontFamily: F.black,
    fontSize: width * 0.09,
    color: "#2E2E2E",
    textAlign: "center",
    lineHeight: width * 0.1,
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    gap: width * 0.025,
    marginBottom: 12,
  },

  col: { flex: 1 },
  colWide: { flex: 2 },
  colNarrow: { flex: 1 },

  inputLabel: {
    fontFamily: F.semibold,
    fontSize: width * 0.034,
    color: "#333",
    marginBottom: 5,
  },

  input: {
    fontFamily: F.regular,
    backgroundColor: "#c8e6c99a",
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: width * 0.03,
    fontSize: width * 0.034,
    color: "#1A1A1A",
  },

  button: {
    backgroundColor: "#2D6A2D",
    borderRadius: 30,
    paddingVertical: width * 0.042,
    marginHorizontal: width * 0.12,
    marginTop: 16,
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
});

export default styles;
