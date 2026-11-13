
import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";

// Use signature-based auth rather than basic auth for Cloudinary uploads.
// See https://cloudinary.com/documentation/authentication_signatures.

type SignatureAlgorithms = "sha1" | "sha256";
const SIGNATURE_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;

// Create a signature: sort params by name, attach API secret, then hash.
// Use SHA-256 as default for requests.
export function signParams(
    params: Record<string, string | number>, 
    apiSecret: string,
    algorithm: SignatureAlgorithms = "sha256",
): string {
    const query = Object.entries(params)
        .filter(([, value]) => value !== "")
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

    return createHash(algorithm).update(query + apiSecret).digest("hex");
}

// Verify the public ID and version signed by Cloudinary.
// Response signatures may use SHA-256 or SHA-1.
export function isGenuineUpload(
    publicId: string,
    version: number,
    signature: string,
    apiSecret: string,
): boolean {
    // The signature must contain exactly 40 hexadecimal characters (SHA-1) or 64 (SHA-256).
    if (!SIGNATURE_PATTERN.test(signature)) return false;

    const algorithm = signature.length === 64 ? "sha256" : "sha1";

    const expected = Buffer.from(
        signParams({ public_id: publicId, version }, apiSecret, algorithm),
        "hex",
    );
    const received = Buffer.from(signature, "hex");

    return timingSafeEqual(expected, received);
}

// Store the version and public ID instead of a full URL.
export function toImagePath(publicId: string, version: number): string {
    return `v${version}/${publicId}`;
}

// Extract the public ID from a stored image path.
export function publicIdOf(path: string): string {
    const match = /^v\d+\/(.+)$/.exec(path);
    if (!match) throw new Error("Invalid Cloudinary image path.");

    return match[1];
}

// Read the credentials from CLOUDINARY_URL.
export function parseCloudinaryUrl(value: string) {
    try {
        const url = new URL(value);

        if (
            url.protocol !== "cloudinary:" ||
            !url.username ||
            !url.password ||
            !url.hostname
        ) {
            return null;
        }

        return {
            apiKey: decodeURIComponent(url.username),
            apiSecret: decodeURIComponent(url.password),
            cloudName: url.hostname,
        };
    } catch {
        return null;
    }
}

// Fields returned by Cloudinary after a successful upload.
export const uploadedImage = z.object({
    publicId: z.string().min(1).max(300),
    version: z.number().int().positive(),
    signature: z.string().regex(SIGNATURE_PATTERN),
});

export type UploadedImage = z.infer<typeof uploadedImage>;
