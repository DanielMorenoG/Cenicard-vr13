import { Dimensions, StyleSheet } from "react-native";
import { F } from "../lib/fonts";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#F4F4F4" },
  scrollContent: {
    paddingHorizontal: width * 0.045,
    paddingTop: 20,
    paddingBottom: 32,
  },

  pageTitle: {
    fontFamily: F.black,
    fontSize: width * 0.06,
    color: "#1A1A1A",
    marginBottom: 20,
    borderBottomWidth: 2.5,
    borderBottomColor: "#2E7D32",
    paddingBottom: 8,
  },

  seccionLabel: {
    fontFamily: F.bold,
    fontSize: width * 0.03,
    color: "#2E7D32",
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    flexDirection: "row",
    padding: 14,
    marginBottom: 10,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },

  cardBody: { flex: 1 },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },

  cardTitulo: {
    fontFamily: F.bold,
    fontSize: width * 0.037,
    color: "#1A1A1A",
    flex: 1,
    marginRight: 8,
  },

  cardHora: {
    fontFamily: F.regular,
    fontSize: width * 0.028,
    color: "#999",
  },

  cardDesc: {
    fontFamily: F.regular,
    fontSize: width * 0.032,
    color: "#555",
    lineHeight: width * 0.048,
  },

  emptyRow: { alignItems: "center", marginTop: 40, gap: 10 },

  emptyText: {
    fontFamily: F.regular,
    fontSize: width * 0.034,
    color: "#CCC",
  },
});

export default styles;
