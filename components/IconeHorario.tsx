import { View } from "react-native";
export function IconeHorario() {
  return (
    <View
      accessible={false}
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: "#006c58",
      }}
    >
      <View
        style={{
          position: "absolute",
          left: 12,
          top: 5,
          width: 2,
          height: 9,
          backgroundColor: "#006c58",
        }}
      />
      <View
        style={{
          position: "absolute",
          left: 12,
          top: 12,
          width: 8,
          height: 2,
          backgroundColor: "#006c58",
        }}
      />
    </View>
  );
}
