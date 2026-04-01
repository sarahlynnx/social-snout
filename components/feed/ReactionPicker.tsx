import { View, Pressable, Image } from "react-native";
import { REACTION_EMOJIS } from "@/constants";
import type { ReactionType } from "@/types/database";

const REACTIONS: ReactionType[] = ["HEART", "LAUGH", "WOW", "IDEA", "SAD"];

interface ReactionPickerProps {
  visible: boolean;
  currentReaction?: ReactionType;
  onSelect: (type: ReactionType) => void;
  onClose: () => void;
}

export function ReactionPicker({
  visible,
  currentReaction,
  onSelect,
  onClose,
}: ReactionPickerProps) {
  if (!visible) return null;

  return (
    <>
      <Pressable
        onPress={onClose}
        style={{
          position: "absolute",
          top: -5000,
          bottom: -5000,
          left: -5000,
          right: -5000,
          zIndex: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          bottom: "100%",
          left: 0,
          marginBottom: 14,
          zIndex: 1000,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#fff",
            borderRadius: 999,
            paddingHorizontal: 2,
            paddingVertical: 2,
            gap: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {REACTIONS.map((type) => {
            const reaction = REACTION_EMOJIS[type];
            const isActive = currentReaction === type;
            return (
              <Pressable
                key={type}
                onPress={() => {
                  onSelect(type);
                  onClose();
                }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isActive ? "#F3F4F6" : "transparent",
                }}
              >
                <Image
                  source={reaction.image}
                  style={{ width: 28, height: 28 }}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </>
  );
}
