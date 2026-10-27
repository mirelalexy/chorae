import express, { type ErrorRequestHandler } from "express";
import { auth } from "./routes/auth";
import { health } from "./routes/health";
import { search } from "./routes/search";
import { rae } from "./routes/rae";
import { jobs, mixtapes } from "./routes/mixtapes";

export const app = express();

app.use(express.json());
app.use("/auth", auth)
app.use("/health", health);
app.use("/search", search);
app.use("/rae", rae);
app.use("/mixtapes", mixtapes);
app.use("/jobs", jobs);

const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong on our side." });
};

app.use(onError);