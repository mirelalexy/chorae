
import { randomUUID } from "node:crypto";
import { config } from "../config";
import {
    isGenuineUpload,
    parseCloudinaryUrl,
    publicIdOf,
    signParams,
    toImagePath,
    type UploadedImage,
} from "./sign";

export const IMAGE_KINDS = ["avatar", "banner", "cover"] as const;
export type ImageKind = (typeof IMAGE_KINDS)[number];

const account = config.CLOUDINARY_URL ? parseCloudinaryUrl(config.CLOUDINARY_URL) : null;

export const uploadsEnabled = account !== null;

const STORED_SIZE = "c_limit,w_2000,h_2000";
const FORMATS = "jpg,png,webp,heic,heif";

// Give the app signed fields to upload directly to Cloudinary.
export function signUpload(userId: string, kind: ImageKind) {
    if (!account) throw new Error("Uploads aren't set up.");

    const params = {
        public_id: `${config.CLOUDINARY_FOLDER}/users/${userId}/${kind}/${randomUUID()}`,
        timestamp: Math.floor(Date.now() / 1000),
        allowed_formats: FORMATS,
        transformation: STORED_SIZE,
    };

    return {
        url: `https://api.cloudinary.com/v1_1/${account.cloudName}/image/upload`,
        fields: {
            ...params,
            api_key: account.apiKey,
            signature: signParams(params, account.apiSecret),
        },
    };
}

// Only accept uploads signed by Cloudinary for this user's folder.
export function acceptUpload(
    image: UploadedImage,
    userId: string,
    kind: ImageKind,
): string | null {
    if (!account) return null;

    const ownFolder = `${config.CLOUDINARY_FOLDER}/users/${userId}/${kind}/`;
    if (!image.publicId.startsWith(ownFolder)) return null;

    const uploadId = image.publicId.slice(ownFolder.length);

    const uuidStructure = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidStructure.test(uploadId)) {
        return null;
    }

    if (!isGenuineUpload(
        image.publicId,
        image.version,
        image.signature,
        account.apiSecret,
    )) {
        return null;
    }

    return toImagePath(image.publicId, image.version);
}

// Display sizes for profile avatars and banners, and mixtape covers.
const SHOWN = {
    avatar: "c_fill,g_auto,w_400,h_400",
    banner: "c_fill,g_auto,w_1200,h_600",
    cover: "c_fill,g_auto,w_1080,h_1080",
    coverSmall: "c_fill,g_auto,w_480,h_480",
} as const;

// Build an optimized URL without storing full URLs in the database.
export function imageUrl(
    path: string | null,
    size: keyof typeof SHOWN,
): string | null {
    if (!path || !account) return null;

    return `https://res.cloudinary.com/${account.cloudName}/image/upload/${SHOWN[size]},f_auto,q_auto/${path}`;
}

// Delete old images without blocking profile or mixtape updates on failure.
export async function deleteImage(path: string | null): Promise<void> {
    if (!path || !account) return;

    try {
        const params = {
            public_id: publicIdOf(path),
            timestamp: Math.floor(Date.now() / 1000),
            invalidate: "true", // tell the CDN to stop serving cached copies of the old image
        };

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${account.cloudName}/image/destroy`,
            {
                method: "POST",
                body: new URLSearchParams({
                    ...params,
                    timestamp: String(params.timestamp),
                    api_key: account.apiKey,
                    signature: signParams(params, account.apiSecret),
                }),
                signal: AbortSignal.timeout(10000),
            },
        );

        if (!res.ok) {
            console.warn(`Couldn't delete image ${path}: HTTP ${res.status}`);
            return;
        }

        const result: { result?: string } = await res.json();

        if (result.result !== "ok" && result.result !== "not found") {
            console.warn(`Couldn't delete image ${path}: ${result.result}`);
        }
    } catch (err) {
        console.warn(`Couldn't delete image ${path}:`, err);
    }
}
