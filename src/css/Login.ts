import { Dimensions, StyleSheet } from "react-native";
import { F } from "../lib/fonts";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  fondoinicial: {
    flex: 1,
    backgroundColor: "#007832",
  },

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
    paddingBottom: 16,
  },

  title: {
    fontFamily: F.black,
    fontSize: width * 0.115,
    color: "#2E2E2E",
    textAlign: "center",
    lineHeight: width * 0.12,
    marginBottom: 10,
  },

  subtitle: {
    fontFamily: F.regular,
    fontSize: width * 0.044,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    marginTop: 6,
  },

  subtitleBold: {
    fontFamily: F.black,
    color: "#2E2E2E",
  },

  inputLabel: {
    fontFamily: F.semibold,
    fontSize: width * 0.038,
    color: "#333",
    marginBottom: 6,
    marginLeft: 2,
  },

  input: {
    fontFamily: F.regular,
    backgroundColor: "#c8e6c99a",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: width * 0.034,
    fontSize: width * 0.038,
    color: "#1A1A1A",
    marginBottom: 14,
  },

  button: {
    backgroundColor: "#2D6A2D",
    borderRadius: 30,
    paddingVertical: width * 0.042,
    marginHorizontal: width * 0.12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 18,
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

  forgotPassword: {
    fontFamily: F.semibold,
    color: "#007832",
    textAlign: "center",
    fontSize: width * 0.038,
    marginBottom: 16,
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },

  registerText: {
    fontFamily: F.regular,
    fontSize: width * 0.036,
    color: "#666",
  },

  registerLink: {
    fontFamily: F.extrabold,
    fontSize: width * 0.038,
    color: "#007832",
  },
});

export default styles;
