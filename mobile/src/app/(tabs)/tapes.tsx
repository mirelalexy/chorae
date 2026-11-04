import { Screen } from "@/components/Screen";
import { useAuth } from "@/auth/AuthProvider";
import { TapesHeader } from "@/components/tapes/TapesHeader";
import { Layout } from "@/components/tapes/TapeItem";
import { useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import { listMixtapes } from "@/api/mixtapes";
import { TextField } from "@/components/TextField";
import { MagnifyingGlassIcon } from "@/components/icons";

export default function Tapes() {
    const { user } = useAuth();
    const [layout, setLayout] = useState<Layout>("list");

    const search = useSearch(listMixtapes);

    function toggleLayout() {
        const next = layout === "list" ? "grid" : "list";
        setLayout(next);
    }
    
    return (
        <Screen>
            <TapesHeader name={user?.displayName ?? ""} layout={layout} onToggleLayout={toggleLayout} />
        
            <TextField
                label="Search your tapes"
                hideLabel
                icon={MagnifyingGlassIcon}
                clearable
                placeholder="Tapes, songs or artists included"
                value={search.query}
                onChangeText={search.setQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
            />
        </Screen>
    );
}