import styles from "./Index.module.css";
import { Login } from "./Auth/Login";
import { authProvider } from "../providers/auth-provider";
import { LoaderFunctionArgs, redirect } from "react-router-dom";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  await authProvider.ready;
  if (
    authProvider.isAuthenticated &&
    url.pathname === "/" &&
    url.search === ""
  ) {
    return redirect("/dashboard");
  }
  return null;
}

export function Index() {
  return (
    <main>
      <p className={styles.content}>
        Thank you for visiting my website! This app is a simple Todo app, that
        uses React, React Router v6, ExpressJS, PostrgreSQL, and PassportJS. Log
        in using the form below! If you don't have an account, one will be made
        for you when you click the link sent to your email address.
      </p>
      <Login />
    </main>
  );
}
