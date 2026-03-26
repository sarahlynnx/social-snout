import { View, Text, ScrollView, Alert } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

export default function ProfileScreen() {
  const { session, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  const userName = session?.user?.user_metadata?.name || "User";
  const userEmail = session?.user?.email || "";

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="items-center pt-8 pb-6 px-6">
        <Avatar name={userName} size="lg" />
        <Text className="text-xl font-bold text-gray-900 mt-4">
          {userName}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">{userEmail}</Text>
      </View>

      <View className="px-6 py-4 border-t border-gray-100">
        <Text className="text-lg font-bold text-gray-900 mb-4">My Pets</Text>
        <Text className="text-base text-gray-500 text-center py-8">
          Your pets will appear here.
        </Text>
      </View>

      <View className="px-6 py-4">
        <Button title="Sign Out" onPress={handleSignOut} variant="outline" />
      </View>
    </ScrollView>
  );
}
