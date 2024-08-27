import { Link, RouteObject, redirect, useLoaderData } from "react-router-dom";
import { authProvider } from "../../providers/auth-provider";
import styles from "./Account.module.css";
import { stripeProvider } from "../../providers/stripe-provider";
import { Checkout, loader as createSubscriptionLoader } from "./CheckoutForm";
import { Success } from "./Success";

export const accountRoutes: RouteObject[] = [
  {
    path: "account",
    element: <Account />,
    loader,
    action,
  },
  {
    path: "account/create-subscription",
    element: <Checkout />,
    loader: createSubscriptionLoader,
  },
  {
    path: "/account/success",
    element: <Success />,
  },
];

async function action() {
  const response = await fetch("/billing/credit", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("There was an error adding credits to your account.");
  }

  await authProvider.refreshUser();
  return redirect("/account");
}

// We need a loader to revalidate the user data after adding credits
async function loader() {
  authProvider.refreshUser();
  await authProvider.ready;
  if (!authProvider.isAuthenticated) {
    return redirect("/");
  }

  if (!stripeProvider.ready) {
    const stipeConfigResponse = await fetch("/checkout/config");
    const stripeConfig = await stipeConfigResponse.json();
    await stripeProvider.init(stripeConfig);
  }

  let message: string | undefined = undefined;
  if (stripeProvider.session) {
    const response = await fetch(
      "/checkout/session?sessionId=" + stripeProvider.session.id
    );

    if (!response.ok) {
      message = "There was an error processing your request.";
    }

    const status = await response.json();

    // Customer is still in the checkout process
    if (status === "open") {
      return redirect("/account/create-subscription");
    }

    // Customer has completed the checkout process, show a message
    if (status === "complete") {
      message = "Your subscription was successful!";
    }

    // Clear the session
    stripeProvider.session = null;
  }

  return { user: authProvider.user, message };
}

export function Account() {
  const { user, message } = useLoaderData() as {
    user: User | null;
    message: string | undefined;
  };

  console.log("User", user);
  if (!user) {
    return <div>Loading...</div>;
  }

  const subscriptionExpiry = user.stripe_subscription_expiry
    ? new Date(user.stripe_subscription_expiry)
    : null;

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <ul className={styles.listContainer}>
          <li>ID: {user.id}</li>
          {user.first_name && (
            <li>
              Name:{" "}
              {`${user.first_name} ${user.last_name ? user.last_name : ""}`}
            </li>
          )}
          <li>Email: {user.email}</li>
          <li>Email Verified: {user.email_verified ? "Yes" : "No"}</li>
          <li>Credit Balance: {user.credit_balance ?? 0}</li>
        </ul>
      </aside>
      <main className={styles.main}>
        {user.first_name && <h2>Welcome {user.first_name}!</h2>}
        {message && <p style={{ color: "green" }}>{message}</p>}
        <p>This is your account page. You can see your account details here.</p>
        <div className={styles.buttonContainer}>
          {subscriptionExpiry &&
          subscriptionExpiry.getTime() > new Date().getTime() ? (
            <form action="/checkout/portal/create" method="POST">
              <button type="submit" className={styles.button}>
                Manage Subscription
              </button>
            </form>
          ) : (
            <Link to="/account/create-subscription" className={styles.button}>
              Create a Subscription
            </Link>
          )}
        </div>
        <p>Credits last for 60 days</p>
      </main>
    </div>
  );
}
