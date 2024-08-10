import express from "express";
import { configurePassport } from "./controllers/passport/passport.js";
import { PORT, BASE_URL } from "./constants.js";
import { httpLogger } from "./tools/logging.js";
import { setupRouters } from "./routes/setup-routers.js";

const app = express();

/*------------------
---- Middleware ----
------------------*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);

// Serve static files
app.use(express.static("build/frontend"));

// Passport
configurePassport(app);

/*------------------
----   Routes   ----
------------------*/
setupRouters(app);

/*------------------
--- Start Server ---
------------------*/
app.listen(PORT, () => console.log(`Server is running at ${BASE_URL}`));
