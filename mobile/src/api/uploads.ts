
import { Platform } from "react-native";
import { api, ApiError } from "./client";

export type UploadKind = "avatar" | "banner" | "cover";

export type UploadedImage = {
    publicId: string;
    version: number;
    signature: string;
};

export type PickedImage = {
    uri: string;
    mimeType?: string;
};

type SignedUpload = {
    url: string;
    fields: Record<string, string | number>;
};

// Upload directly to Cloudinary using fields signed by the API.
export async function uploadImage(
    kind: UploadKind,
    image: PickedImage,
): Promise<UploadedImage> {
    const { url, fields } = await api<SignedUpload>("/uploads/sign", {
        method: "POST",
        body: { kind },
    });

    const form = new FormData();

    for (const [name, value] of Object.entries(fields)) {
        form.append(name, String(value));
    }

    const mimeType = image.mimeType ?? "image/jpeg";
    const extension = mimeType.split("/")[1] ?? "jpg";

    // React Native accepts file URIs, while web uploads need a Blob.
    const file = Platform.OS === "web"
        ? await (await fetch(image.uri)).blob()
        : ({
            uri: image.uri,
            name: `${kind}.${extension}`,
            type: mimeType,
        } as unknown as Blob);

    form.append("file", file);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
        const res = await fetch(url, {
            method: "POST",
            body: form,
            signal: controller.signal,
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.public_id) {
            console.warn("[upload]", res.status, data?.error?.message);

            throw new ApiError(
                res.status,
                res.status === 400
                    ? "That picture couldn't be uploaded. Check its format and size."
                    : "Couldn't upload that picture. Try again.",
            );
        }

        if (
            typeof data.public_id !== "string" ||
            !Number.isSafeInteger(data.version) ||
            data.version <= 0 ||
            typeof data.signature !== "string" ||
            !/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i.test(data.signature)
        ) {
            throw new ApiError(0, "Cloudinary returned an invalid upload response.");
        }

        return {
            publicId: data.public_id,
            version: data.version,
            signature: data.signature,
        };
    } catch (error) {
        if (error instanceof ApiError) throw error;

        throw new ApiError(
            0,
            controller.signal.aborted
                ? "The upload took too long. Try again."
                : "Couldn't upload that picture. Check your connection.",
        );
    } finally {
        clearTimeout(timeout);
    }
}