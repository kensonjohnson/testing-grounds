import express from "express";
import { configurePassport } from "./controllers/passport/passport.js";
import { PORT, BASE_URL } from "./constants.js";
import { httpLogger } from "./tools/logging.js";
import { setupRouters } from "./routes/setup-routers.js";

const app = express();

/*------------------
---- Middleware ----
------------------*/
app.use(express.urlencoded({ extended: true }));
app.use(
  express.json({
    // This is specifically for the Stripe webhook
    verify(req, res, buf) {
      if (req.url === "/webhook/stripe") {
        req.rawBody = buf.toString();
      }
    },
  })
);

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
