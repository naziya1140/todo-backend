import express from 'express';
import {
    getAllTasks,
    addNewTask,
    updateCompletionStatus,
    updateTask,
    deleteTask,
    sortAndSaveTask
} from '../controllers/controller.js';

const todoRouter = express.Router();

todoRouter.get('/', getAllTasks);
todoRouter.post('/', addNewTask);
todoRouter.put('/sort', sortAndSaveTask);
todoRouter.patch('/:id', updateCompletionStatus);
todoRouter.put('/:id', updateTask);
todoRouter.delete('/:id', deleteTask);

export default todoRouter;