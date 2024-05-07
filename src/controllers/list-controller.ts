import type { Request, Response } from "express";
import { pool } from "../db/db.js";

export async function getLists(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const query = await pool.query("SELECT * FROM list WHERE user_id = $1", [
      userId,
    ]);

    if (!query) throw new Error("Failed to fetch lists.");

    res.status(200).json(query.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch lists." });
  }
}

export async function getList(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const query = await pool.query(
      "SELECT * FROM list WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (!query) throw new Error("Failed to fetch list.");

    res.status(200).json(query.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch list." });
  }
}

export async function createList(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { title, description } = req.body;
    const query = await pool.query(
      "INSERT INTO list (title, description, user_id) VALUES ($1, $2, $3) RETURNING *",
      [title, description, userId]
    );

    if (!query) throw new Error("Failed to create list.");

    res.status(201).json(query.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create list." });
  }
}

export async function updateList(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, description } = req.body;
    const query = await pool.query(
      "UPDATE list SET title = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
      [title, description, id, userId]
    );

    if (!query) throw new Error("Failed to update list.");

    res.status(200).json(query.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update list." });
  }
}

export async function deleteList(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const query = await pool.query(
      "DELETE FROM list WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (!query) throw new Error("Failed to delete list.");

    res.status(200).json(query.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete list." });
  }
}
