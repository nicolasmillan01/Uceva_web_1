import { Router } from 'express';
import { EventController as c } from '../controllers/event.controller.js';
const router=Router();
router.get('/',c.all); router.get('/:id',c.byId); router.post('/',c.create); router.put('/:id',c.update); router.delete('/:id',c.delete);
export default router;
