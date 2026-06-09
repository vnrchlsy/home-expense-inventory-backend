import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  res.json(result.rows);
});

router.post('/', async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const existing = await pool.query('SELECT id FROM categories WHERE LOWER(name) = LOWER($1)', [name]);
  if (existing.rows.length > 0) return res.status(409).json({ error: 'Category already exists' });
  const result = await pool.query(
    'INSERT INTO categories (name) VALUES ($1) RETURNING *',
    [name]
  );
  res.status(201).json(result.rows[0]);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ deleted: result.rows[0].id });
});

export default router;
