import {
  Outlet,
  LoaderFunctionArgs,
  redirect,
  useLoaderData,
} from "react-router-dom";
import { authProvider } from "./providers/auth-provider";
import { Header } from "./components/Header/Header";

type RootLoaderData = {
  user: User | null;
  loggedIn: boolean;
};

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if redirect is sent from the server
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("r");
  if (redirectTo) {
    return redirect("/" + redirectTo);
  }

  await authProvider.ready;
  return {
    user: authProvider.user,
    loggedIn: authProvider.isAuthenticated,
  };
}

export function Root() {
  const { loggedIn } = useLoaderData() as RootLoaderData;
  return (
    <>
      <Header loggedIn={loggedIn} />
      <Outlet />
    </>
  );
}
