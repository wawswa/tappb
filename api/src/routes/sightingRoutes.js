import { Router } from 'express';
import * as sightingController from '../controllers/sightingController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', sightingController.listSightings);
router.get('/:id', sightingController.getSighting);
router.post('/', requireAuth, sightingController.createSighting);
router.put('/:id', requireAdmin, sightingController.updateSighting);
router.delete('/:id', requireAdmin, sightingController.deleteSighting);

export default router;
