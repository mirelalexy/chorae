import type { BetaMessage } from "@anthropic-ai/sdk/resources/beta.js";
import type { z } from "zod";

// Turn Rae's reply into checked data. Say what went wrong.
export type Answer<T> =
    | { ok: true, value: T }
    | { ok: false, reason: string, retry: boolean };

export function readAnswer<T>(
    message: Pick<BetaMessage, "stop_reason" | "content">, 
    schema: z.ZodType<T>
): Answer<T> {
    if (message.stop_reason === "refusal") {
        return { ok: false, reason: "Rae declined this request.", retry: false };
    }

    if (message.stop_reason === "max_tokens") {
        return { ok: false, reason: "The answer was cut off before it was finished.", retry: false };
    }

    const text = message.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("");

    let json: unknown;
    try {
        json = JSON.parse(text);
    } catch {
        return { ok: false, reason: "The answer was not valid JSON.", retry: true };
    }

    // Check based on Zod schema as well.
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return { ok: false, reason: `The answer didn't fit the schema at ${issue?.path.join(".")}: ${issue?.message}`, retry: true };
    }

    return { ok: true, value: parsed.data };
}