import { api } from "./client";

export type JobStatus = "queued" | "drafting" | "matching" | "saving" | "done" | "failed";

export type ActiveJob = {
    id: string; 
    status: JobStatus; 
    prompt: string;
};

export type MixtapeSummary = {
    id: string;
    title: string;
    createdAt: string;
    isStory: boolean;
    trackCount: number;
    totalMs: number;
    covers: string[];
};

export type Today = { 
    used: number; 
    limit: number; 
    resetsAt: string | null 
};

export async function getActiveJob(): Promise<ActiveJob | null> {
    const res = await api<{ job: ActiveJob | null }>("/jobs/active");
    return res.job;
}

export async function listMixtapes(): Promise<MixtapeSummary[]> {
    const res = await api<{ mixtapes: MixtapeSummary[] }>("/mixtapes");
    return res.mixtapes;
}

export async function getToday(): Promise<Today> {
    return api<Today>("/mixtapes/today");
}