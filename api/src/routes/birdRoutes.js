import { Router } from 'express';
import * as birdController from '../controllers/birdController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', birdController.listBirds);
router.get('/:id', birdController.getBird);
router.post('/', requireAdmin, birdController.createBird);
router.put('/:id', requireAdmin, birdController.updateBird);
router.delete('/:id', requireAdmin, birdController.deleteBird);

export default router;
