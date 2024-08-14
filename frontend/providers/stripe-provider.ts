import type Stripe from "stripe";
import { loadStripe, type Stripe as StripeJS } from "@stripe/stripe-js";

type StripeConfig = {
  publishableKey: string;
  clientSecret: string;
  stripeSubscriptionPriceId: string;
};

export class StripeProvider {
  #stripe: StripeJS | null = null;
  #stripeSubscriptionPriceId: string | null = null;
  #initialSetupComplete: boolean = false;
  #session: Stripe.Checkout.Session | null = null;

  constructor() {}

  get ready() {
    return this.#stripe !== null && this.#initialSetupComplete;
  }

  get stripe() {
    return this.#stripe;
  }

  get subscriptionPriceId() {
    return this.#stripeSubscriptionPriceId;
  }

  get session() {
    return this.#session;
  }

  setSession(session: Stripe.Checkout.Session | null) {
    this.#session = session;
  }

  async init(config: StripeConfig) {
    if (typeof config.publishableKey !== "string") {
      console.error("Invalid publishable key, must be a string");
      return;
    }
    if (typeof config.stripeSubscriptionPriceId !== "string") {
      console.error("Invalid stripe subscription price id, must be a string");
      return;
    }
    this.#stripe = await loadStripe(config.publishableKey);
    this.#stripeSubscriptionPriceId = config.stripeSubscriptionPriceId;
    this.#initialSetupComplete = true;
  }
}

export const stripeProvider = new StripeProvider();
