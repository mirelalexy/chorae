export type TasteMode = "onboarding" | "edit";

export type TasteStepProps = {
    // onboarding: right after signing up, with Skip, on to Home at the end.
    // edit: in Settings, no Skip, back to Settings at the end.
    mode: TasteMode;
};