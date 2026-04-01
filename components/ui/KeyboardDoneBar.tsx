import { useState, useEffect } from "react";
import { View, Pressable, Text, Keyboard, Platform } from "react-native";

export const KEYBOARD_DONE_ID = "keyboard-done";

export function KeyboardDoneBar() {
  const [visible, setVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: keyboardHeight,
        left: 0,
        right: 0,
        zIndex: 9999,
        flexDirection: "row",
        justifyContent: "flex-end",
        backgroundColor: "#D1D3D9",
        borderTopWidth: 0.5,
        borderTopColor: "#B8B8BB",
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <Pressable onPress={Keyboard.dismiss} hitSlop={8}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#007AFF" }}>
          Done
        </Text>
      </Pressable>
    </View>
  );
}
