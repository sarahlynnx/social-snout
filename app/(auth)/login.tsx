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
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginScreen() {
  const { signIn, resendVerification, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred.";

      if (message.toLowerCase().includes("email not confirmed")) {
        Alert.alert(
          "Email Not Verified",
          "Please check your email and click the verification link before signing in.",
          [
            { text: "OK", style: "cancel" },
            {
              text: "Resend Email",
              onPress: async () => {
                try {
                  await resendVerification(email.trim());
                  Alert.alert("Sent!", "A new verification email has been sent.");
                } catch {
                  Alert.alert("Error", "Failed to resend verification email.");
                }
              },
            },
          ]
        );
      } else {
        Alert.alert("Sign In Failed", message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Enter Your Email", "Please enter your email address above, then tap Forgot Password.");
      return;
    }

    try {
      await resetPassword(email.trim());
      Alert.alert("Check Your Email", "If an account exists with that email, we've sent a password reset link.");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to send reset email."
      );
    }
  };

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
          <View className="items-center mb-8">
            <Text className="text-5xl leading-tight mb-2">🐾</Text>
            <Text className="text-3xl font-bold text-gray-900">
              SocialSnout
            </Text>
            <Text className="text-base text-gray-500 mt-2">
              Connect your pets with new friends
            </Text>
          </View>

          <View className="gap-4">
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
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="password"
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              className="mt-2"
            />

            <Pressable onPress={handleForgotPassword} className="items-center mt-3">
              <Text className="text-sm text-gray-400">Forgot Password?</Text>
            </Pressable>
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-500">Don't have an account? </Text>
            <Link href="/(auth)/register">
              <Text className="text-primary-500 font-semibold">Sign Up</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
