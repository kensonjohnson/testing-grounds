import { Router } from "express";
import {
  createStripeBillingPortal,
  createStripeCheckoutSession,
  getStripeCheckoutSession,
  getStripeConfig,
} from "../controllers/stripe/checkout-controller.js";

const checkoutRouter = Router();

checkoutRouter.get("/session", getStripeCheckoutSession);

checkoutRouter.post("/session/create", createStripeCheckoutSession);

checkoutRouter.get("/config", getStripeConfig);

checkoutRouter.post("/portal/create", createStripeBillingPortal);

export { checkoutRouter };
