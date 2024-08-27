import { Link } from "react-router-dom";

export function Success() {
  return (
    <>
      <div>
        Subscription successful! Credits have been added to your account.
      </div>
      <Link to="/account">Back to account</Link>
    </>
  );
}
