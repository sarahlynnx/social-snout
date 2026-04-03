import { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  Share,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

// TODO: Replace with actual App Store / Play Store URL when published
const APP_LINK = "https://socialsnout.app";

interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
}

export function InviteModal({ visible, onClose }: InviteModalProps) {
  const { session } = useAuth();
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleClose = () => {
    setShowEmailInput(false);
    setEmail("");
    onClose();
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Join me on SocialSnout! It's a social app for pets to find friends, playdates, and more. 🐾\n\n${APP_LINK}`,
      });
    } catch {
      // user cancelled share
    }
    handleClose();
  };

  const handleSendEmail = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    if (!trimmed.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setSending(true);
    const { error } = await supabase
      .from("invites")
      .upsert(
        { inviter_id: session!.user.id, invited_email: trimmed },
        { onConflict: "inviter_id,invited_email" }
      );
    setSending(false);

    if (error) {
      Alert.alert("Error", "Failed to send invite. Please try again.");
    } else {
      Alert.alert(
        "Invite Sent!",
        `We'll let ${trimmed} know about SocialSnout.`
      );
      handleClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        onPress={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            onPress={() => {}}
            className="bg-white rounded-t-3xl px-6 pt-4 pb-10"
          >
            {/* Handle bar */}
            <View className="items-center mb-4">
              <View className="w-10 h-1 rounded-full bg-gray-300" />
            </View>

            <Text className="text-xl font-bold text-gray-900 mb-1">
              Invite a Friend
            </Text>
            <Text className="text-sm text-gray-500 mb-6">
              Bring more pals to the park!
            </Text>

            {!showEmailInput ? (
              <View className="gap-3">
                <Pressable
                  onPress={handleShareLink}
                  className="flex-row items-center gap-4 bg-gray-50 rounded-2xl p-4"
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: "#F4F7F4",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="share-outline" size={22} color="#5A8A4F" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      Share Link
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Send via text, social media, or anywhere
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#A8A49C" />
                </Pressable>

                <Pressable
                  onPress={() => setShowEmailInput(true)}
                  className="flex-row items-center gap-4 bg-gray-50 rounded-2xl p-4"
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: "#FDF6F2",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="mail-outline" size={22} color="#C4754A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      Send Email Invite
                    </Text>
                    <Text className="text-sm text-gray-500">
                      We'll send them a branded invite
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#A8A49C" />
                </Pressable>
              </View>
            ) : (
              <View className="gap-4">
                <Input
                  label="Friend's Email"
                  placeholder="friend@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoFocus
                />
                <Button
                  title="Send Invite"
                  onPress={handleSendEmail}
                  loading={sending}
                />
                <Pressable
                  onPress={() => {
                    setShowEmailInput(false);
                    setEmail("");
                  }}
                  className="items-center py-2"
                >
                  <Text className="text-sm text-gray-500">Back</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
