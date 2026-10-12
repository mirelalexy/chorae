import express, { type ErrorRequestHandler } from "express";
import { health } from "./routes/health";

export const app = express();

app.use(express.json());
app.use("/health", health);

const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong on our side." });
};

app.use(onError);