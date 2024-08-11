declare namespace Express {
  export interface User {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    email_verified: boolean;
    initial_setup_complete: boolean;
    credit_balance: number;
  }
}

declare module "http" {
  interface IncomingMessage {
    rawBody?: string;
  }
}

declare module "passport-magic-link" {
  import type { SentMessageInfo } from "nodemailer";
  import { Strategy } from "passport";
  import { User } from "express";
  import type { AuthenticateOptions } from "passport";

  export type SendEmailToUser = (
    user: User,
    token: string
  ) => Promise<SentMessageInfo>;
  export type VerifyUser = (user: User) => Promise<User>;

  export interface MagicLinkAuthenticateOptions extends AuthenticateOptions {
    action: "requestToken" | "verifyToken";
  }

  export interface MagicLinkStrategyOptions {
    secret: string;
    userFields: string[];
    tokenField: string;
    verifyUserAfterToken: boolean;
  }

  export class Strategy extends Strategy {
    constructor(
      options: MagicLinkStrategyOptions,
      sendEmailToUser: SendEmailToUser,
      verifyUser: VerifyUser
    );
    authenticate(
      this: StrategyCreated<this>,
      req: express.Request,
      options?: MagicLinkAuthenticateOptions
    ): void;
  }
}
