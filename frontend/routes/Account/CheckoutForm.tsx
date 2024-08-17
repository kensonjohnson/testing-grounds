import type Stripe from "stripe";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useLoaderData } from "react-router-dom";
import { stripeProvider } from "../../providers/stripe-provider";

export async function loader() {
  if (!stripeProvider.ready) {
    const stipeConfigResponse = await fetch("/checkout/config");
    const stripeConfig = await stipeConfigResponse.json();
    await stripeProvider.init(stripeConfig);
  }

  if (!stripeProvider.session) {
    const response = await fetch("/checkout/session/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId: stripeProvider.subscriptionPriceId,
      }),
    });

    if (!response.ok) {
      throw new Error("There was an error creating the checkout session.");
    }

    const { session } = await response.json();
    stripeProvider.session = session;
  }

  return stripeProvider.session;
}

export function Checkout() {
  const session = useLoaderData() as Stripe.Checkout.Session;

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <EmbeddedCheckoutProvider
      stripe={stripeProvider.stripe}
      options={{ clientSecret: session.client_secret }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
