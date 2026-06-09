import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// GET all expenses
router.get('/', async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
  res.json(result.rows);
});

// GET single expense
router.get('/:id', async (req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM expenses WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

// POST create expense
router.post('/', async (req: Request, res: Response) => {
  const { title, amount, category, description, date } = req.body;
  if (!title || !amount || !category) {
    return res.status(400).json({ error: 'title, amount, and category are required' });
  }
  const result = await pool.query(
    `INSERT INTO expenses (title, amount, category, description, date)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [title, amount, category, description ?? null, date ?? new Date()]
  );
  res.status(201).json(result.rows[0]);
});

// PUT update expense
router.put('/:id', async (req: Request, res: Response) => {
  const { title, amount, category, description, date } = req.body;
  const result = await pool.query(
    `UPDATE expenses
     SET title = COALESCE($1, title),
         amount = COALESCE($2, amount),
         category = COALESCE($3, category),
         description = COALESCE($4, description),
         date = COALESCE($5, date),
         updated_at = NOW()
     WHERE id = $6 RETURNING *`,
    [title, amount, category, description, date, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

// DELETE expense
router.delete('/:id', async (req: Request, res: Response) => {
  const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING id', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ deleted: result.rows[0].id });
});

export default router;
