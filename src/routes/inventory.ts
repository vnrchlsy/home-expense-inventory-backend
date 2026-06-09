import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// GET all inventory items
router.get('/', async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM inventory_items ORDER BY name ASC');
  res.json(result.rows);
});

// GET single item
router.get('/:id', async (req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM inventory_items WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

// POST create item
router.post('/', async (req: Request, res: Response) => {
  const { name, quantity, unit, location, estimated_value, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const result = await pool.query(
    `INSERT INTO inventory_items (name, quantity, unit, location, estimated_value, notes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, quantity ?? 1, unit ?? null, location ?? null, estimated_value ?? null, notes ?? null]
  );
  res.status(201).json(result.rows[0]);
});

// PUT update item
router.put('/:id', async (req: Request, res: Response) => {
  const { name, quantity, unit, location, estimated_value, notes } = req.body;
  const result = await pool.query(
    `UPDATE inventory_items
     SET name = COALESCE($1, name),
         quantity = COALESCE($2, quantity),
         unit = COALESCE($3, unit),
         location = COALESCE($4, location),
         estimated_value = COALESCE($5, estimated_value),
         notes = COALESCE($6, notes),
         updated_at = NOW()
     WHERE id = $7 RETURNING *`,
    [name, quantity, unit, location, estimated_value, notes, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

// DELETE item
router.delete('/:id', async (req: Request, res: Response) => {
  const result = await pool.query('DELETE FROM inventory_items WHERE id = $1 RETURNING id', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ deleted: result.rows[0].id });
});

export default router;
