import type { Request, Response } from "express";
import { db } from "../../drizzle/db.js";
import { stripe } from "./stripe.js";
import {
  BASE_URL,
  STRIPE_PRICE_ID,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET,
} from "../../constants.js";

export async function getStripeCheckoutSession(req: Request, res: Response) {
  const sessionId = req.params.sessionId;
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json({ session });
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
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/cancel`,
    });

    res.redirect(303, session.url!);
  } catch (error) {
    console.error(error);
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
  // TODO: Convert to using the stripe customer id stored in the database, instead of the client passing up the session id
  const { sessionId } = req.body;
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: checkoutSession.customer as string,
    return_url: `${BASE_URL}/account`,
  });

  res.redirect(303, portalSession.url);
}

export function processStripeWebhook(req: Request, res: Response) {
  if (!req.headers["stripe-signature"]) {
    return res.sendStatus(400);
  }
  const signature = req.headers["stripe-signature"];
  try {
    const event = stripe.webhooks.constructEvent(
      // Possibly need to make a rawBody middleware??
      req.rawBody!,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    const data = event.data;
    const eventType = event.type;

    if (eventType === "checkout.session.completed") {
      console.log("🔔  Payment received!", data);
      // Do something with the data
    }

    res.sendStatus(200);
  } catch (error) {
    console.log("⚠️  Webhook signature verification failed.");
    return res.sendStatus(400);
  }
}
