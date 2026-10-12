import { app } from "./app";
import { config } from "./config";

app.listen(config.PORT, () => {
    console.log(`Chorae API listening on: http://localhost:${config.PORT}.`);
});