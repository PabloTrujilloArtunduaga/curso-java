import { Request, Response } from 'express';
import { query } from '../db/index.js';

export const getModules = async (_req: Request, res: Response) => {
  try {
    const modulesRes = await query(`SELECT id as "moduleId", title, description, status FROM modules ORDER BY id ASC`);
    return res.json(modulesRes.rows);
  } catch (error) {
    console.error('Error al obtener módulos:', error);
    return res.status(500).json({ message: 'Error interno al obtener módulos.' });
  }
};

export const updateModuleStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['LOCKED', 'OPEN', 'CLOSED'].includes(status)) {
      return res.status(400).json({ message: 'Estado de módulo no válido.' });
    }

    await query(`UPDATE modules SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [status, id]);

    const updatedRes = await query(`SELECT id as "moduleId", title, description, status FROM modules ORDER BY id ASC`);
    return res.json(updatedRes.rows);
  } catch (error) {
    console.error('Error al actualizar estado del módulo:', error);
    return res.status(500).json({ message: 'Error al actualizar estado del módulo.' });
  }
};
