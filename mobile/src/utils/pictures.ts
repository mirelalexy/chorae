import * as ImagePicker from "expo-image-picker";
import {
    uploadImage,
    type PickedImage,
    type UploadedImage,
    type UploadKind,
} from "@/api/uploads";

// Null keeps the current image, remove clears it, and a picked image replaces it.
export type PictureChange = null | "remove" | PickedImage;

// Let the user pick an image, cropping square images when possible.
export async function pickPicture(shape: "square" | "wide"): Promise<PickedImage | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: shape === "square",
        aspect: [1, 1],
        quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return null;

    const { uri, mimeType } = result.assets[0];
    return { uri, mimeType };
}

// Preview the pending change without saving it.
export function shownPicture(saved: string | null, change: PictureChange): string | null {
    if (change === "remove") return null;
    return change ? change.uri : saved;
}

// Turn the pending change into a value the API accepts.
export async function settlePicture(
    kind: UploadKind,
    change: PictureChange,
): Promise<UploadedImage | null | undefined> {
    if (change === null) return undefined;
    if (change === "remove") return null;

    return uploadImage(kind, change);
}