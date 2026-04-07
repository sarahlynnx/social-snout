import { useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation } from "expo-router";

export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  const navigation = useNavigation();

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      Alert.alert(
        "Discard changes?",
        "You have unsaved changes. Are you sure you want to leave?",
        [
          { text: "Keep editing", style: "cancel", onPress: () => { } },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [hasUnsavedChanges, navigation]);
}
