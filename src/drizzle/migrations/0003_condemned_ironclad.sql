ALTER TABLE "credit" ADD COLUMN "stripe_subscription_id" varchar(255);--> statement-breakpoint
ALTER TABLE "credit" ADD COLUMN "stripe_invoice_id" varchar(255);--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "stripe_subscription_id";