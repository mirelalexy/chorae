
import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import {
    isGenuineUpload,
    parseCloudinaryUrl,
    publicIdOf,
    signParams,
    toImagePath,
    uploadedImage,
} from "./sign";

const upload = {
    publicId: "chorae/users/u/avatar/x",
    version: 1700000000,
};
const secret = "secret";

test("signs params with SHA-1 as shown in Cloudinary's documentation", () => {
    // See https://cloudinary.com/documentation/authentication_signatures,
    // section Signed HTTP upload with additional body parameters.
    const signature = signParams(
        {
            timestamp: 1315060510,
            public_id: "sample_image",
            eager: "w_400,h_300,c_pad|w_260,h_200,c_crop",
        },
        "abcd",
        "sha1",
    );

    assert.equal(signature, "bfd09f95f331f558cbd1320e67aa8d488770583e");
});

test("uses SHA-256 by default", () => {
    const params = { public_id: "sample_image", timestamp: 1315060510 };
    const query = "public_id=sample_image&timestamp=1315060510";

    const expected = createHash("sha256")
        .update(query + "abcd")
        .digest("hex");

    assert.equal(signParams(params, "abcd"), expected);
    assert.equal(signParams(params, "abcd").length, 64);
});

test("leaves empty params out of the signature", () => {
    assert.equal(signParams({ a: 1, b: "" }, "s"), signParams({ a: 1 }, "s"));
});

for (const algorithm of ["sha1", "sha256"] as const) {
    test(`verifies genuine ${algorithm.toUpperCase()} upload responses`, () => {
        const signature = signParams(
            { public_id: upload.publicId, version: upload.version },
            secret,
            algorithm,
        );

        assert.equal(isGenuineUpload(upload.publicId, upload.version, signature, secret), true);
        assert.equal(isGenuineUpload(upload.publicId + "changed", upload.version, signature, secret), false);
        assert.equal(isGenuineUpload(upload.publicId, upload.version + 1, signature, secret), false);
        assert.equal(isGenuineUpload(upload.publicId, upload.version, signature, "wrong-secret"), false);
    });
}

test("rejects malformed upload signatures", () => {
    assert.equal(isGenuineUpload(upload.publicId, upload.version, "nope", secret), false);
    assert.equal(isGenuineUpload(upload.publicId, upload.version, "g".repeat(64), secret), false);
    assert.equal(isGenuineUpload(upload.publicId, upload.version, "a".repeat(63), secret), false);
});

test("validates upload response fields", () => {
    for (const algorithm of ["sha1", "sha256"] as const) {
        const signature = signParams(
            { public_id: upload.publicId, version: upload.version },
            secret,
            algorithm,
        );

        assert.equal(uploadedImage.safeParse({ ...upload, signature }).success, true);
    }

    assert.equal(uploadedImage.safeParse({ ...upload, signature: "invalid" }).success, false);
    assert.equal(uploadedImage.safeParse({ ...upload, version: -1, signature: "a".repeat(64) }).success, false);
});

test("an image path keeps the version and gives back the public ID", () => {
    const path = toImagePath("chorae/users/u/banner/abc", 42);

    assert.equal(path, "v42/chorae/users/u/banner/abc");
    assert.equal(publicIdOf(path), "chorae/users/u/banner/abc");
    assert.throws(() => publicIdOf("invalid/path"), /Invalid Cloudinary image path/);
});

test("reads the CLOUDINARY_URL from the dashboard", () => {
    assert.deepEqual(
        parseCloudinaryUrl("cloudinary://123:abc-DEF@my-cloud"),
        { apiKey: "123", apiSecret: "abc-DEF", cloudName: "my-cloud" },
    );

    assert.equal(parseCloudinaryUrl("https://example.com"), null);
    assert.equal(parseCloudinaryUrl("not-a-url"), null);
});
