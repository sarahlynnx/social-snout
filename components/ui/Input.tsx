import { useState } from "react";
import { View, Text, TextInput, Pressable, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", secureTextEntry, ...props }: InputProps) {
  const [hidden, setHidden] = useState(true);

  return (
    <View className="w-full">
      {label ? (
        <Text className="text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </Text>
      ) : null}
      <View className="relative">
        <TextInput
          className={`bg-gray-50 border rounded-xl px-4 py-4 text-gray-900 ${
            error ? "border-red-500" : "border-gray-200"
          } ${secureTextEntry ? "pr-12" : ""} ${className}`}
          style={{ fontSize: 16, minHeight: 48 }}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry && hidden}
          {...props}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setHidden((prev) => !prev)}
            className="absolute right-4 top-0 bottom-0 justify-center"
          >
            <Ionicons
              name={hidden ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#9CA3AF"
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <Text className="text-sm text-red-500 mt-1">{error}</Text>
      ) : null}
    </View>
  );
}
