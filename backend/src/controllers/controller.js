import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url); //getting full path of current module.
const __dirname = path.dirname(__filename)//extracting current module.
const DB_PATH = path.join(__dirname, '../../database/db.json') //building path to JSON DB file.

async function readTask() {
    try {
        const data = await readFile(DB_PATH, 'utf-8')
        return JSON.parse(data);
    } catch (e) {
        console.error('Error in writing files:', e);
    }
}

async function writeTask(data) {
    try {
        await writeFile(DB_PATH, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error in reading files', e);
    }
}


const getAllTasks = async (req, res) => {
    try {
        const data = await readTask();
        if(!data){
            throw new Error("Failed to fetch task List")
        }
        console.log("this is get all function" , data);
        res.json(data.tasks);
        
    } catch (e) {
        res.status(500).json({ error: `Failed to read tasks ${e}`});
    }
}

const addNewTask = async (req, res) => {
    try {
        const {id, task, preference, timeDate, tags, completed } = req.body;

        const newTask = {
            id,
            task,
            preference,
            timeDate,
            tags,
            completed,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        const data = await readTask();
        data.tasks.push(newTask);
        await writeTask(data);
        res.status(201).json({ message: 'New task added!'});

    }
    catch (e) {
        res.status(500).json({ error: `Failed to add new task, ${e}` });
    }
}

const updateCompletionStatus = async (req, res) => {
    try {
        const {id} = req.params;
        const data = await readTask();
        const isFound = false;
        for (let task of data.tasks) {
            if (id == task.id) {
                isFound = true;
                task.completed = (!task.completed);
            }
        }
        if (!isFound) return res.status(404).json({ error: `Task not found` });
        await writeTask(data);
    }
    catch (e) {
        res.status(500).json({ error: `failed to update task. , ${e}` })
    }
}

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await readTask();
        let isFound = false;
        const {task, preference, dateTime, tags, completed} = req.body;

        for (let t of data.tasks) {
            if (id === t.id) {
                isFound = true;
                t.task = task;
                t.preference = preference;
                t.dateTime = dateTime;
                t.tags = tags;
                t.completed = completed;
                t.updatedAt = new Date().toISOString();
            }
        }
        if (!isFound) return res.status(404).json({ error: `Task not found` });
        await writeTask(data);
    }
    catch (e) {
        res.status(500).json({ error: `failed to update task. , ${e}` })
    }
}


const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await readTask();
        const len = data.tasks.length;

        data.tasks = data.tasks.filter((task) => task.id !== id);

        if (data.tasks.length == len) {
            return res.status(404).json({ error: `task to be deleted not found` });
        }
        await writeFile(data);
        res.status(204).json({ success: `task added successfully!` });
    }
    catch (e) {
        res.status(500).json({ error: `failed to delete task, ${e}` })
    }
}

const sortAndSaveTask = async (req, res) =>{
    try{
        const {sortedTasks} = req.body;
        console.log(sortedTasks);
        await writeTask(sortedTasks);
        return;
    } catch(e){
        res.status(500).json({error: `failed to sort task, ${e}`});
    }
}

export { getAllTasks, addNewTask, updateCompletionStatus, updateTask, deleteTask ,sortAndSaveTask };
