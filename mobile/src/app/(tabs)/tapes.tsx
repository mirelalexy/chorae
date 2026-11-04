import { Text } from "react-native";
import { Screen } from "@/components/Screen";
import { colors, type } from "@/theme";

export default function Tapes() {
    return (
        <Screen>
            <Text style={[type.title, { color: colors.text }]}>Your tapes</Text>
        </Screen>
    );
}