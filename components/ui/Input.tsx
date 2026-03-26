import { View, Text, TextInput, type TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <View className="w-full">
      {label ? (
        <Text className="text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </Text>
      ) : null}
      <TextInput
        className={`bg-gray-50 border rounded-xl px-4 py-3.5 text-base text-gray-900 ${
          error ? "border-red-500" : "border-gray-200"
        } ${className}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error ? (
        <Text className="text-sm text-red-500 mt-1">{error}</Text>
      ) : null}
    </View>
  );
}
