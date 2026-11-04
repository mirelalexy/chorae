import { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { space } from "@/theme";

type Props = {
    children: ReactNode;
    bottomSpace?: number;
};

// The frame every form screen sits in.
export function Screen({ children, bottomSpace = 0 }: Props) {
    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView 
                    contentContainerStyle={[
                        styles.content,
                        { paddingBottom: space.xl + bottomSpace }
                    ]} 
                    keyboardShouldPersistTaps="handled"
                >
                    {children}
                </ScrollView>
            </KeyboardAvoidingView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    content: {
        flexGrow: 1,
        padding: space.xl,
        gap: space.lg,
    },
});