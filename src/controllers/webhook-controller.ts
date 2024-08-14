import type { Request, Response } from "express";
import type Stripe from "stripe";
import { stripe } from "./stripe/stripe.js";
import { STRIPE_WEBHOOK_SECRET } from "../constants.js";
import { db } from "../drizzle/db.js";
import { eq } from "drizzle-orm";
import { UserTable } from "../drizzle/schema.js";

export function processStripeWebhook(req: Request, res: Response) {
  req.log.info("🔔  Webhook received!");
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

    const eventType = event.type;

    if (eventType === "invoice.paid") {
      const data = event.data.object as Stripe.Invoice;
      req.log.info(data, "🔔  Payment received!");
      const user = db.query.UserTable.findFirst({
        where: eq(UserTable.stripe_customer_id, data.customer as string),
      });
    }

    req.log.info(eventType, "🔔  Event type: ");
    // req.log.info("Data: ", data);

    res.sendStatus(200);
  } catch (error) {
    req.log.error("⚠️  Webhook signature verification failed.");
    return res.sendStatus(400);
  }
}
