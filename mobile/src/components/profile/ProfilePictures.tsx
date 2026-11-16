
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "@/components/Avatar";
import { CameraIcon } from "@/components/icons";
import { TextButton } from "@/components/TextButton";
import { colors, radius, space } from "@/theme";

const BANNER_HEIGHT = 128;
const AVATAR_SIZE = 88;

type Props = {
    name: string;
    avatarUrl: string | null;
    bannerUrl: string | null;
    onPickAvatar: () => void;
    onPickBanner: () => void;
    onRemoveAvatar: () => void;
    onRemoveBanner: () => void;
    disabled?: boolean;
};

// Edit the profile pictures (avatar and banner) with previews of any pending changes.
export function ProfilePictures({
    name,
    avatarUrl,
    bannerUrl,
    onPickAvatar,
    onPickBanner,
    onRemoveAvatar,
    onRemoveBanner,
    disabled = false,
}: Props) {
    return (
        <View>
            <Pressable
                onPress={onPickBanner}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={bannerUrl ? "Change banner" : "Add a banner"}
                style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
            >
                {bannerUrl && (
                    <Image
                        aria-hidden
                        source={{ uri: bannerUrl }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                    />
                )}
                <CameraBadge />
            </Pressable>

            <View style={styles.avatar}>
                <Pressable
                    onPress={onPickAvatar}
                    disabled={disabled}
                    accessibilityRole="button"
                    accessibilityLabel={avatarUrl ? "Change profile picture" : "Add a profile picture"}
                    style={({ pressed }) => [styles.ring, pressed && styles.pressed]}
                >
                    <Avatar name={name} url={avatarUrl} size={AVATAR_SIZE} />
                    <CameraBadge />
                </Pressable>
            </View>

            {(avatarUrl || bannerUrl) && (
                <View style={styles.actions}>
                    {avatarUrl && (
                        <TextButton
                            title="Remove picture"
                            label="Remove profile picture"
                            onPress={onRemoveAvatar}
                            disabled={disabled}
                        />
                    )}
                    {bannerUrl && (
                        <TextButton
                            title="Remove banner"
                            onPress={onRemoveBanner}
                            disabled={disabled}
                        />
                    )}
                </View>
            )}
        </View>
    );
}

// Show a camera icon over editable pictures.
function CameraBadge() {
    return (
        <View aria-hidden style={styles.badge}>
            <CameraIcon color={colors.text} size={16} />
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        height: BANNER_HEIGHT,
        borderRadius: radius.card,
        overflow: "hidden",
        backgroundColor: colors.field,
        borderWidth: 1,
        borderColor: colors.line,
    },

    avatar: {
        flexDirection: "row",
        marginTop: -(AVATAR_SIZE / 2),
        paddingLeft: space.lg,
    },

    // Separate the overlapping avatar from the banner.
    ring: {
        padding: 4,
        borderRadius: AVATAR_SIZE,
        backgroundColor: colors.background,
    },

    actions: {
        flexDirection: "row",
        gap: space.xl,
        paddingLeft: space.lg,
    },

    badge: {
        position: "absolute",
        right: space.sm,
        bottom: space.sm,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(27, 26, 30, 0.7)",
        alignItems: "center",
        justifyContent: "center",
    },

    pressed: {
        opacity: 0.8,
    },
});