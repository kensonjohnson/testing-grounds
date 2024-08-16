import type { Request, Response } from "express";
import { db } from "../drizzle/db.js";
import { CreditTable, DebitTable, UserTable } from "../drizzle/schema.js";
import { and, eq, gt, sum } from "drizzle-orm";

export async function getBalance(req: Request, res: Response) {
  const userId = req.user!.id;
  try {
    const [user] = await db
      .select({ credit_balance: UserTable.credit_balance })
      .from(UserTable)
      .where(eq(UserTable.id, userId));
    res.json(user);
  } catch (error) {
    req.log.error(error);
  }
}

export async function addCredits(req: Request, res: Response) {
  const userId = req.user!.id;
  try {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Calculate the user's balance, updating it in this user's account.
    const { balance } = await db.transaction(async (tx) => {
      await tx.insert(CreditTable).values({ user_id: userId, amount: 10 });
      const credits = await tx
        .select({ credit: sum(CreditTable.amount) })
        .from(CreditTable)
        .where(
          and(
            eq(CreditTable.user_id, userId),
            gt(CreditTable.created_on, sixtyDaysAgo)
          )
        );
      const debits = await tx
        .select({ debit: sum(DebitTable.amount) })
        .from(DebitTable)
        .where(
          and(
            eq(DebitTable.user_id, userId),
            gt(DebitTable.created_on, sixtyDaysAgo)
          )
        );

      const balance =
        Number(credits.at(0)?.credit) - Number(debits.at(0)?.debit);

      await tx
        .update(UserTable)
        .set({ credit_balance: balance })
        .where(eq(UserTable.id, userId));

      return {
        balance,
      };
    });

    res.json({
      message: "Credit successful",
      amount: 10,
      new_balance: balance,
    });
  } catch (error) {
    req.log.error(error);
    res.end().status(500);
  }
}

export async function removeCredits(req: Request, res: Response) {
  const userId = req.user!.id;

  try {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Calculate the user's balance, updating it in this user's account.
    const { balance } = await db.transaction(async (tx) => {
      await db.insert(DebitTable).values({ user_id: userId, amount: 1 });
      const credits = await tx
        .select({ credit: sum(CreditTable.amount) })
        .from(CreditTable)
        .where(
          and(
            eq(CreditTable.user_id, userId),
            gt(CreditTable.created_on, sixtyDaysAgo)
          )
        );
      const debits = await tx
        .select({ debit: sum(DebitTable.amount) })
        .from(DebitTable)
        .where(
          and(
            eq(DebitTable.user_id, userId),
            gt(DebitTable.created_on, sixtyDaysAgo)
          )
        );

      const balance =
        Number(credits.at(0)?.credit) - Number(debits.at(0)?.debit);

      await tx
        .update(UserTable)
        .set({ credit_balance: balance })
        .where(eq(UserTable.id, userId));

      return {
        balance,
      };
    });

    res.json({ message: "Debit successful", amount: 1, new_balance: balance });
  } catch (error) {
    req.log.error(error);
    res.end().status(500);
  }
}
