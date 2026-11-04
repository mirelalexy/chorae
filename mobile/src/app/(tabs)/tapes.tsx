import { Text } from "react-native";
import { Screen } from "@/components/Screen";
import { colors, type } from "@/theme";
import { useAuth } from "@/auth/AuthProvider";
import { TapesHeader } from "@/components/tapes/TapesHeader";
import { Layout } from "@/components/tapes/TapeItem";
import { useState } from "react";

export default function Tapes() {
    const { user } = useAuth();
    const [layout, setLayout] = useState<Layout>("list");

    function toggleLayout() {
        const next = layout === "list" ? "grid" : "list";
        setLayout(next);
    }
    
    return (
        <Screen>
            <TapesHeader name={user?.displayName ?? ""} layout={layout} onToggleLayout={toggleLayout} />
        </Screen>
    );
}