import { Router } from "express";
import { processStripeWebhook } from "../controllers/webhook-controller.js";

const webhookRouter = Router();

webhookRouter.post("/stripe", processStripeWebhook);

export { webhookRouter };
