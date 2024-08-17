import type { Request, Response } from "express";
import { db } from "../../drizzle/db.js";
import { stripe } from "./stripe.js";
import {
  BASE_URL,
  STRIPE_PRICE_ID,
  STRIPE_PUBLISHABLE_KEY,
} from "../../constants.js";
import { UserTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export async function getStripeCheckoutSession(req: Request, res: Response) {
  const sessionId = req.params.sessionId;
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json({
      status: session.status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createStripeCheckoutSession(req: Request, res: Response) {
  const { priceId } = req.body;
  if (!priceId) {
    return res.status(400).json({ error: "Price ID is required" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: req.user!.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      ui_mode: "embedded",
      return_url: `${BASE_URL}?r=account`,
    });

    res.json({ session });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export function getStripeConfig(req: Request, res: Response) {
  res.json({
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    stripeSubscriptionPriceId: STRIPE_PRICE_ID,
  });
}

export async function createStripeBillingPortal(req: Request, res: Response) {
  const user = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, req.user!.id),
  });

  if (!user) {
    throw new Error("createStripeBillingPortal: User not found");
  }

  if (!user.stripe_customer_id) {
    return res
      .status(400)
      .json({ error: "User does not have a stripe customer ID" });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${BASE_URL}?r=account`,
  });

  res.redirect(303, portalSession.url);
}
