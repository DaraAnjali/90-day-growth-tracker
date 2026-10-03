import {Router} from 'express';import auth from '../middleware/auth.js';import {listTasks,createTask,updateTask,deleteTask} from '../controllers/taskController.js';
const r=Router();r.use(auth);r.get('/',listTasks);r.post('/',createTask);r.patch('/:id',updateTask);r.delete('/:id',deleteTask);export default r;
