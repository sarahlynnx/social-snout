import { View, Text, Image } from "react-native";

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-10 h-10",
  md: "w-16 h-16",
  lg: "w-24 h-24",
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
        className={`${sizeMap[size]} rounded-full ${className}`}
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
