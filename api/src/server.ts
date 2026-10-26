import { app } from "./app";
import { config } from "./config";
import { startWorker } from "./jobs/worker";

app.listen(config.PORT, () => {
    console.log(`Chorae API listening on: http://localhost:${config.PORT}.`);
});

// The worker runs alongside the API to pick up queued jobs.
startWorker().catch((err) => {
    console.error("The worker stopped: ", err);
    process.exit(1);
})