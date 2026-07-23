import { Pressable, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  testID,
}: ButtonProps) {
  const baseStyles = "py-4 px-6 rounded-2xl items-center justify-center flex-row";

  const variantStyles = {
    primary: "bg-primary-500 active:bg-primary-600",
    secondary: "bg-secondary-500 active:bg-secondary-600",
    outline: "border-2 border-primary-500 bg-transparent active:bg-primary-50",
  };

  const textStyles = {
    primary: "text-white font-semibold text-base",
    secondary: "text-white font-semibold text-base",
    outline: "text-primary-500 font-semibold text-base",
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      className={`${baseStyles} ${variantStyles[variant]} ${isDisabled ? "opacity-50" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#5A8A4F" : "#FFFFFF"}
          className="mr-2"
        />
      ) : null}
      <Text className={textStyles[variant]}>{title}</Text>
    </Pressable>
  );
}
