import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { config } from "../config";
import { draftMessage, questionsMessage, RAE_SYSTEM } from "./prompt";
import { DraftRequest, draftSchema, questionsSchema } from "./schemas";
import { z } from "zod";

// Every request to Rae goes through this.
const MODEL = "claude-opus-5-5";
export class RaeError extends Error {}

// Create client on first use, so the server can start without an API key.
let client: Anthropic | null = null;

function getClient(): Anthropic {
    if (!config.ANTHROPIC_API_KEY) throw new RaeError("ANTHROPIC_API_KEY isn't set in .env file.");
    client ??= new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });
    return client;
}

type Options = {
    effort: "low" | "medium" | "high";
    maxTokens: number;
};

// Send one message to Rae and return her answer. Check it against schema.
// Ask once more if the answer is malformed, then turn to a RaeError.
async function ask<T>(schema: z.ZodType<T>, message: string, options: Options): Promise<T> {
    // The schema goes to the API, but handle validation separately, since a refusal or an
    // incomplete answer is not the same as a malformed one.
    const { parse: _parse, ...format } = betaZodOutputFormat(schema);

    for (let attempt = 1; attempt <= 2; attempt++) {
        const response = await getClient().beta.messages.stream({
            model: MODEL,
            max_tokens: options.maxTokens,
            system: [
                {
                    type: "text",
                    text: RAE_SYSTEM,
                    cache_control: { type: "ephemeral" },
                }
            ],
            messages: [
                {
                    role: "user",
                    content: message,
                }
            ],
            output_config: {
                effort: options.effort,
                format,
            },
            // Retry the request on another model instead of failing.
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
        }).finalMessage();

        // Find out how many tokens the request used.
        const { usage } = response;

        console.info(`${usage.input_tokens} tokens in (${usage.cache_read_input_tokens ?? 0} from cache), ${usage.output_tokens} out`);

        // TODO: Get answer.
        // ...
    }

    throw new RaeError("Unreachable");
}

export function askQuestions(prompt: string) {
    return ask(questionsSchema, questionsMessage(prompt), { effort: "low", maxTokens: 16000 });
}

export function writeDraft(request: DraftRequest) {
    return ask(draftSchema, draftMessage(request), { effort: "medium", maxTokens: 64000 });
}