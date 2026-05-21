import { Dimensions, StyleSheet } from "react-native";
import { F } from "../lib/fonts";

const { width } = Dimensions.get("window");

const ACTIVE_COLOR = "#2E7D32";
const INACTIVE_COLOR = "#9E9E9E";

export { ACTIVE_COLOR, INACTIVE_COLOR };
export const ICON_ACTIVE_COLOR = "#fff";

export default StyleSheet.create({
  safeArea: {
    backgroundColor: "transparent",
  },

  container: {
    flexDirection: "row",
    backgroundColor: "rgba(223,238,226,0.82)",
    paddingBottom: 8,
    paddingTop: 8,
    borderRadius: 50,
    marginHorizontal: 8,
    marginBottom: 8, // ← era 4
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },

  iconWrapper: {
    width: width * 0.165,
    height: width * 0.112,
    borderRadius: 300,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  iconWrapperActive: {
    backgroundColor: ACTIVE_COLOR,
  },

  label: {
    fontFamily: F.medium,
    fontSize: width * 0.028,
    color: INACTIVE_COLOR,
  },

  labelActive: {
    fontFamily: F.bold,
    color: ACTIVE_COLOR,
  },
});