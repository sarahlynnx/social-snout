import { View, Text } from "react-native";
import { Image } from "expo-image";

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { width: 40, height: 40 },
  md: { width: 64, height: 64 },
  lg: { width: 96, height: 96 },
};

const textSizeMap = {
  sm: "text-sm",
  md: "text-xl",
  lg: "text-3xl",
};

export function Avatar({ uri, name, size = "md", className = "" }: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ ...sizeMap[size], borderRadius: sizeMap[size].width / 2 }}
        contentFit="cover"
        transition={150}
      />
    );
  }

  return (
    <View
      className={`${sizeMap[size]} rounded-full bg-primary-100 items-center justify-center ${className}`}
    >
      <Text className={`${textSizeMap[size]} font-bold text-primary-600`}>
        {initials}
      </Text>
    </View>
  );
}
