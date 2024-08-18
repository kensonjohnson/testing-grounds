declare type User = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  email_verified: boolean;
  initial_setup_complete: boolean;
  credit_balance: number;
  dark_mode: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_expiry: string | null;
};

declare type List = {
  id: number;
  title: string;
  description: string;
  user_id: number;
  created_on: Date;
  last_updated: Date;
  tasks: Task[];
};

declare type Task = {
  id: number;
  title: string;
  description: string;
  list_id: number;
  created_on: Date;
  last_updated: Date;
  completed: boolean;
};

declare type Conversation = {
  id: number;
  title: string;
};

type ChatObject = {
  role: "user" | "system";
  content: string;
};
