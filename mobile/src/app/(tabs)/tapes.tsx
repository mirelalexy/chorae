import { Screen } from "@/components/Screen";
import { useAuth } from "@/auth/AuthProvider";
import { TapesHeader } from "@/components/tapes/TapesHeader";
import { Layout } from "@/components/tapes/TapeItem";
import { useMemo, useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import { listMixtapes } from "@/api/mixtapes";
import { TextField } from "@/components/TextField";
import { MagnifyingGlassIcon } from "@/components/icons";
import { useTapes } from "@/hooks/useTapes";
import { Kind, Sort, sortTapes } from "@/utils/tapes";
import { TapesFilters } from "@/components/tapes/TapesFilters";
import { ActivityIndicator, Text, StyleSheet } from "react-native";
import { colors, type } from "@/theme";
import { TapesLibrary } from "@/components/tapes/TapesLibrary";
import { router } from "expo-router";

export default function Tapes() {
    const { user } = useAuth();

    const library = useTapes();
    const search = useSearch(listMixtapes);

    const [layout, setLayout] = useState<Layout>("list");
    const [sort, setSort] = useState<Sort>("recent");
    const [kind, setKind] = useState<Kind | null>(null);

    // Only show origin filters when the library contains both kinds of tapes.
    const hasBothKinds = useMemo(
        () => new Set((library.tapes ?? []).map((tape) => tape.origin)).size > 1,
        [library.tapes]
    );

    // Apply filtering and sorting to either the library or the search results.
    const shown = useMemo(() => {
        const tapes = search.active ? search.results : (library.tapes ?? []);
        const filtered = hasBothKinds && kind
            ? tapes.filter((tape) => tape.origin === kind)
            : tapes;

        return sortTapes(filtered, sort);
    }, [library.tapes, search.active, search.results, hasBothKinds, kind, sort]);

    const error = library.error ?? search.error;
    const loading = (library.tapes === null && library.error === null) || search.loading;
    
    function toggleLayout() {
        setLayout((current) => current === "list" ? "grid" : "list");
    }

    return (
        <Screen>
            <TapesHeader 
                name={user?.displayName ?? ""} 
                layout={layout} 
                onToggleLayout={toggleLayout}
                sort={sort}
                onSortChange={setSort}
            />
        
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

            {hasBothKinds && (
                <TapesFilters
                    kind={kind}
                    onKindChange={setKind}
                />
            )}

            {error && (
                <Text style={styles.error}>{error}</Text>
            )}

            {loading && (
                <ActivityIndicator color={colors.textMuted} />
            )}

            {library.tapes && (
                <TapesLibrary
                    tapes={shown}
                    today={library.today}
                    layout={layout}
                    searching={search.active}
                    onNewTape={() => router.push("/new-tape")}
                    onOpenTape={(tape) => 
                        router.push({
                            pathname: "/mixtapes/[id]",
                            params: { id: tape.id },
                        })
                    }
                />
            )}

            {search.active && !search.loading && !search.error && shown.length === 0 && (
                <Text style={styles.empty}>
                    No tapes with "{search.search}" in them.
                </Text>
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    error: {
        ...type.small,
        color: colors.error,
    },

    empty: {
        ...type.body,
        color: colors.textMuted,
    },
});