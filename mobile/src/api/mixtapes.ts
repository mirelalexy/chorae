import { api } from "./client";

export type JobStatus = "queued" | "drafting" | "matching" | "saving" | "done" | "failed";

export type ActiveJob = {
    id: string; 
    status: JobStatus; 
    prompt: string;
};

export type Job = {
    status: JobStatus;
    tracksTotal: number | null;
    tracksMatched: number;
    error: string | null;
    mixtapeId: string | null;
    title: string | null; // the tape's name, once Rae has written it
};

export type MixtapeSummary = {
    id: string;
    title: string;
    origin: "generated" | "curated";
    createdAt: string;
    updatedAt: string;
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

export type Question = { 
    text: string; 
    suggestions: string[] 
};

export type Answer = { 
    question: string; 
    answer: string 
};

export type Seed = { 
    title: string; 
    artist: string 
};

type Song = {
    mbid: string;
    title: string;
    artist: string;
    coverUrl: string | null;
};

export type SongResult = Song & {
    year: string | null;
};

export type Track = Song & {
    lengthMs: number | null;
    note: string;
    isSeed: boolean;
};

type Side = {
    title: string;
    moodLine: string;
    tracks: Track[];
};

export type NewMixtape = {
    prompt: string;
    answers: Answer[];
    minutes: number;
    seeds: Seed[];
    story: boolean;
    title?: string; // user's own name for it, Rae names it otherwise
};

export type Mixtape = {
    id: string;
    title: string;
    origin: "generated" | "curated";
    shareSlug: string;
    version: number;
    intro: string;
    isStory: boolean;
    missingSeeds: Seed[];
    sides: Side[];
};

// Library and daily generation limit.
export async function getActiveJob(): Promise<ActiveJob | null> {
    const res = await api<{ job: ActiveJob | null }>("/jobs/active");
    return res.job;
}

export async function listMixtapes(q?: string): Promise<MixtapeSummary[]> {
    const res = await api<{ mixtapes: MixtapeSummary[] }>(q ? `/mixtapes?q=${encodeURIComponent(q)}` : "/mixtapes");
    return res.mixtapes;
}

export async function getToday(): Promise<Today> {
    return api<Today>("/mixtapes/today");
}

// Search and prepare a new mixtape.
export async function searchSongs(q: string): Promise<SongResult[]> {
    const res = await api<{ songs: SongResult[] }>(`/search/songs?q=${encodeURIComponent(q)}`);
    return res.songs;
}

export async function askQuestions(prompt: string, seeds: Seed[]): Promise<Question[]> {
    const res = await api<{ questions: Question[] }>("/rae/questions", { method: "POST", body: { prompt, seeds } });
    return res.questions;
}

// Answers right away with the job to follow while Rae works.
export async function createMixtape(input: NewMixtape): Promise<string> {
    const res = await api<{ jobId: string }>("/mixtapes", { method: "POST", body: input });
    return res.jobId;
}

// Follow generation progress and retrieve the finished mixtape.
export async function getJob(id: string): Promise<Job> {
    return api<Job>(`/jobs/${id}`);
}

export async function retryJob(id: string): Promise<void> {
    await api(`/jobs/${id}/retry`, { method: "POST" });
}

export async function getMixtape(id: string): Promise<Mixtape> {
    return api<Mixtape>(`/mixtapes/${id}`);
}