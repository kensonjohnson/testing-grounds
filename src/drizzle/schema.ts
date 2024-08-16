import {
  pgTable,
  index,
  varchar,
  json,
  timestamp,
  uniqueIndex,
  bigserial,
  boolean,
  integer,
  text,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { SQL, relations, sql } from "drizzle-orm";

export const SessionTable = pgTable(
  "session",
  {
    sid: varchar("sid").primaryKey().notNull(),
    sess: json("sess").notNull(),
    expire: timestamp("expire", { precision: 6, mode: "date" }).notNull(),
  },
  (table) => {
    return {
      IDX_session_expire: index("IDX_session_expire").using(
        "btree",
        table.expire
      ),
    };
  }
);

export const UserTable = pgTable(
  "users",
  {
    id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
    first_name: varchar("first_name", { length: 100 }),
    last_name: varchar("last_name", { length: 100 }),
    email: text("email").notNull(),
    email_verified: boolean("email_verified").default(false).notNull(),
    initial_setup_complete: boolean("initial_setup_complete")
      .default(false)
      .notNull(),
    credit_balance: integer("credit_balance").default(0).notNull(),
    dark_mode: boolean("dark_mode").default(false).notNull(),
    stripe_customer_id: varchar("stripe_customer_id", { length: 255 }),
  },
  (table) => {
    return {
      emailUniqueIndex: uniqueIndex("emailUniqueIndex").on(lower(table.email)),
    };
  }
);

// custom lower function
export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}

export const ListTable = pgTable("list", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  user_id: bigserial("user_id", { mode: "number" })
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  created_on: timestamp("created_on", { mode: "date" }).defaultNow(),
  last_updated: timestamp("last_updated", { mode: "date" }).defaultNow(),
});

export const TaskTable = pgTable("task", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  list_id: bigserial("list_id", { mode: "number" })
    .notNull()
    .references(() => ListTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  completed: boolean("completed").default(false).notNull(),
  created_on: timestamp("created_on", { mode: "date" }).defaultNow().notNull(),
  last_updated: timestamp("last_updated", { mode: "date" })
    .defaultNow()
    .notNull(),
});

export const ConversationTable = pgTable("conversation", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  user_id: bigserial("user_id", { mode: "number" })
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  created_on: timestamp("created_on", { mode: "date" }).defaultNow().notNull(),
  last_updated: timestamp("last_updated", { mode: "date" })
    .defaultNow()
    .notNull(),
});

export const MessageTable = pgTable("message", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  conversation_id: bigserial("conversation_id", { mode: "number" })
    .notNull()
    .references(() => ConversationTable.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull(),
  total_token_count: integer("total_token_count").default(0).notNull(),
  prompt_token_count: integer("prompt_token_count").default(0).notNull(),
  response_token_count: integer("response_token_count").default(0).notNull(),
  content: text("content").notNull(),
  created_on: timestamp("created_on", { mode: "date" }).defaultNow().notNull(),
});

export const CreditTable = pgTable("credit", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  user_id: bigserial("user_id", { mode: "number" })
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  amount: integer("amount").default(0).notNull(),
  stripe_subscription_id: varchar("stripe_subscription_id", { length: 255 }),
  stripe_invoice_id: varchar("stripe_invoice_id", { length: 255 }),
  created_on: timestamp("created_on", { mode: "date" }).defaultNow().notNull(),
});

export const DebitTable = pgTable("debit", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  user_id: bigserial("user_id", { mode: "number" })
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  amount: integer("amount").default(0).notNull(),
  created_on: timestamp("created_on", { mode: "date" }).defaultNow().notNull(),
});

// Relationships
export const UserTableRelations = relations(UserTable, ({ many }) => {
  return {
    lists: many(ListTable),
    conversations: many(ConversationTable),
    credits: many(CreditTable),
    debits: many(DebitTable),
  };
});

export const ListTableRelations = relations(ListTable, ({ one, many }) => {
  return {
    user: one(UserTable, {
      fields: [ListTable.user_id],
      references: [UserTable.id],
    }),
    tasks: many(TaskTable),
  };
});

export const TaskTableRelations = relations(TaskTable, ({ one }) => {
  return {
    ListTable: one(ListTable, {
      fields: [TaskTable.list_id],
      references: [ListTable.id],
    }),
  };
});

export const ConversationTableRelations = relations(
  ConversationTable,
  ({ one, many }) => {
    return {
      user: one(UserTable, {
        fields: [ConversationTable.user_id],
        references: [UserTable.id],
      }),
      messages: many(MessageTable),
    };
  }
);

export const MesageTableRelations = relations(MessageTable, ({ one }) => {
  return {
    conversation: one(ConversationTable, {
      fields: [MessageTable.conversation_id],
      references: [ConversationTable.id],
    }),
  };
});

export const CreditTableRelations = relations(CreditTable, ({ one }) => {
  return {
    user: one(UserTable, {
      fields: [CreditTable.user_id],
      references: [UserTable.id],
    }),
  };
});

export const DebitTableRelations = relations(DebitTable, ({ one }) => {
  return {
    user: one(UserTable, {
      fields: [DebitTable.user_id],
      references: [UserTable.id],
    }),
  };
});

// export const update_last_updated_column = `CREATE OR REPLACE FUNCTION update_last_updated_column()
//     RETURNS TRIGGER
//     AS $$
// BEGIN
//     NEW.last_updated = now();
//     RETURN NEW;
// END;
// $$ LANGUAGE 'plpgsql';`;

// export const update_conversation_last_updated_column = `CREATE OR REPLACE FUNCTION update_conversation_last_updated_column()
//     RETURNS TRIGGER
//     AS $$
// BEGIN
//     UPDATE conversation SET last_updated = now() WHERE id = NEW.conversation_id;
//     RETURN NEW;
// END;
// $$ LANGUAGE 'plpgsql';`;

// export const update_credit_balance = `CREATE OR REPLACE FUNCTION update_credit_balance()
//     RETURNS TRIGGER
//     AS $$
// BEGIN
//     UPDATE user SET credit_balance = (
//         SELECT (
//             SELECT COALESCE(SUM(amount), 0) FROM credit WHERE user_id = NEW.user_id AND created_on > NOW() - INTERVAL '10' minute
//         ) - (
//             SELECT COALESCE(SUM(amount), 0) FROM debit WHERE user_id = NEW.user_id AND created_on > NOW() - INTERVAL '10' minute
//         )
//     ) WHERE id = NEW.user_id;
//     RETURN NEW;
// END;
// $$ LANGUAGE 'plpgsql';`;

// export const get_credit_balance = `CREATE OR REPLACE FUNCTION get_credit_balance(userid bigserial)
//     RETURNS integer
//     AS $$
// BEGIN
//     RETURN (
//         SELECT COALESCE(SUM(amount), 0) FROM credit WHERE user_id = userid AND created_on > NOW() - INTERVAL '10' minute
//     ) - (
//         SELECT COALESCE(SUM(amount), 0) FROM debit WHERE user_id = userid AND created_on > NOW() - INTERVAL '10' minute
//     );
// END;
// $$ LANGUAGE 'plpgsql';`;

// // Define the triggers
// export const refresh_list_updated_at = `CREATE OR REPLACE TRIGGER refresh_list_updated_at
//     BEFORE UPDATE ON list
//     FOR EACH ROW
//     EXECUTE FUNCTION update_last_updated_column();`;

// export const refresh_task_updated_at = `CREATE OR REPLACE TRIGGER refresh_task_updated_at
//     BEFORE UPDATE ON task
//     FOR EACH ROW
//     EXECUTE FUNCTION update_last_updated_column();`;

// export const refresh_conversation_updated_at = `CREATE OR REPLACE TRIGGER refresh_conversation_updated_at
//     BEFORE UPDATE ON conversation
//     FOR EACH ROW
//     EXECUTE FUNCTION update_last_updated_column();`;

// export const refresh_conversation_updated_at_on_message_insert = `CREATE OR REPLACE TRIGGER refresh_conversation_updated_at_on_message_insert
//     AFTER INSERT ON message
//     FOR EACH ROW
//     EXECUTE FUNCTION update_conversation_last_updated_column();`;

// export const update_credit_balance_on_credit_insert = `CREATE OR REPLACE TRIGGER update_credit_balance_on_credit_insert
//     AFTER INSERT ON credit
//     FOR EACH ROW
//     EXECUTE FUNCTION update_credit_balance();`;

// export const update_credit_balance_on_debit_insert = `CREATE OR REPLACE TRIGGER update_credit_balance_on_debit_insert
//     AFTER INSERT ON debit
//     FOR EACH ROW
//     EXECUTE FUNCTION update_credit_balance();`;
