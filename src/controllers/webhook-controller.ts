import type { Request, Response } from "express";
import { stripe } from "./stripe/stripe.js";
import { STRIPE_WEBHOOK_SECRET } from "../constants.js";
import { db } from "../drizzle/db.js";
import { and, eq, gt, sum } from "drizzle-orm";
import { CreditTable, DebitTable, UserTable } from "../drizzle/schema.js";

export async function processStripeWebhook(req: Request, res: Response) {
  if (!req.headers["stripe-signature"]) {
    return res.sendStatus(400);
  }

  const signature = req.headers["stripe-signature"];
  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody!,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    const eventType = event.type;

    if (eventType === "invoice.paid") {
      const data = event.data.object;
      const customerEmail = data.customer_email;
      const invoiceId = data.id;
      const subscriptionId = data.subscription as string | null;
      if (!customerEmail || !invoiceId) {
        return res.sendStatus(400);
      }

      const user = await db.query.UserTable.findFirst({
        where: eq(UserTable.email, customerEmail),
      });
      if (user === undefined) {
        res.sendStatus(404);
        return;
      }

      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      await db.transaction(async (tx) => {
        // Increase the user's credit balance
        await tx.insert(CreditTable).values({
          user_id: user.id,
          stripe_subscription_id: subscriptionId,
          stripe_invoice_id: invoiceId,
          amount: 10,
        });

        // Recalculate the user's balance
        const credits = await tx
          .select({ credit: sum(CreditTable.amount) })
          .from(CreditTable)
          .where(
            and(
              eq(CreditTable.user_id, user.id),
              gt(CreditTable.created_on, sixtyDaysAgo)
            )
          );
        const debits = await tx
          .select({ debit: sum(DebitTable.amount) })
          .from(DebitTable)
          .where(
            and(
              eq(DebitTable.user_id, user.id),
              gt(DebitTable.created_on, sixtyDaysAgo)
            )
          );

        const balance =
          Number(credits.at(0)?.credit) - Number(debits.at(0)?.debit);

        // Set the user's new expiry date to 1 month + 1 day from now
        const newExpiry = new Date();
        newExpiry.setMonth(newExpiry.getMonth() + 1);
        newExpiry.setDate(newExpiry.getDate() + 1);

        await tx
          .update(UserTable)
          .set({
            credit_balance: balance,
            stripe_subscription_expiry: newExpiry,
          })
          .where(eq(UserTable.id, user.id));

        if (!user.stripe_customer_id && data.customer) {
          await tx
            .update(UserTable)
            .set({ stripe_customer_id: data.customer as string })
            .where(eq(UserTable.id, user.id));
        }
      });
    }

    res.sendStatus(200);
  } catch (error) {
    req.log.error("⚠️  Webhook signature verification failed.");
    return res.sendStatus(400);
  }
}
