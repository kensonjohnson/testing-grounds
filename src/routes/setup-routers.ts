import type { Express } from "express";
import { authRouter } from "./auth.js";
import { userRouter } from "./user.js";
import { listRouter } from "./list.js";
import { taskRouter } from "./task.js";
import { conversationRouter } from "./conversation.js";
import { billingRouter } from "./billing.js";
import { checkoutRouter } from "./checkout.js";
import { webhookRouter } from "./webhook.js";
import { ensureAuthenticated } from "../controllers/auth-controller.js";
import { catchUnmatchedRequestAndRedirectEncoded } from "../controllers/root-controller.js";

export function setupRouters(app: Express) {
  app.use("/auth", authRouter);
  app.use("/user", ensureAuthenticated, userRouter);
  app.use("/list", ensureAuthenticated, listRouter);
  app.use("/task", ensureAuthenticated, taskRouter);
  app.use("/conversation", ensureAuthenticated, conversationRouter);
  app.use("/billing", ensureAuthenticated, billingRouter);
  app.use("/checkout", ensureAuthenticated, checkoutRouter);
  app.use("/webhook", webhookRouter);

  app.all("*", catchUnmatchedRequestAndRedirectEncoded);
}
