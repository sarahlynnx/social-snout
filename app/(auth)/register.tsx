import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterScreen() {
  const { signUp, resendVerification } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [resending, setResending] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email.trim(), password, name.trim());
      if (result.needsEmailConfirmation) {
        setPendingVerification(true);
      }
    } catch (error) {
      Alert.alert(
        "Sign Up Failed",
        error instanceof Error ? error.message : "An error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification(email.trim());
      Alert.alert("Sent!", "A new verification email has been sent.");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to resend email."
      );
    } finally {
      setResending(false);
    }
  };

  if (pendingVerification) {
    return (
      <View className="flex-1 justify-center items-center px-6 bg-white">
        <Ionicons name="mail-outline" size={64} color="#5A8A4F" />
        <Text className="text-2xl font-bold text-gray-900 mt-6 text-center">
          Check Your Email
        </Text>
        <Text className="text-base text-gray-500 mt-3 text-center leading-6">
          We sent a verification link to{"\n"}
          <Text className="font-semibold text-gray-700">{email.trim()}</Text>
        </Text>
        <Text className="text-sm text-gray-400 mt-2 text-center">
          Click the link in the email to activate your account, then come back
          here to sign in.
        </Text>

        <Button
          title={resending ? "Sending..." : "Resend Verification Email"}
          onPress={handleResend}
          loading={resending}
          variant="outline"
          className="mt-8 w-full"
        />

        <Link href="/(auth)/login" asChild>
          <Pressable className="mt-4">
            <Text className="text-primary-500 font-semibold">
              Go to Sign In
            </Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          <View className="items-center mb-12">
            <Text className="text-5xl leading-tight mb-2">🐾</Text>
            <Text className="text-3xl font-bold text-gray-900">
              Create Account
            </Text>
            <Text className="text-base text-gray-500 mt-2">
              Join SocialSnout and find playmates for your pet
            </Text>
          </View>

          <View className="gap-4">
            <Input
              label="Name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              textContentType="name"
            />

            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />

            <Input
              label="Password"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              className="mt-2"
            />
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-500">Already have an account? </Text>
            <Link href="/(auth)/login">
              <Text className="text-primary-500 font-semibold">Sign In</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
