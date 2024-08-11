import assert from "assert";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "../../constants.js";

export const stripe = new Stripe(STRIPE_SECRET_KEY);
