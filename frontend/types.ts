declare type User = {
  id: number;
  email: string;
};

declare type List = {
  id: number;
  title: string;
  description: string;
  user_id: number;
  created_on: Date;
  last_updated: Date;
};
