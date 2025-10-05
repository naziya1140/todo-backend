import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url); //getting full path of current module.
const __dirname = path.dirname(__filename)//extracting current module.
const DB_PATH = path.join(__dirname, '../../database/db.json') //building path to JSON DB file.

//returning task.
async function readTask() {
  try {
    const data = await readFile(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.tasks;
  } catch (e) {
    console.error('Error reading tasks file:', e);
    return [];
  }
}

//writing values in tasks.
async function writeTask(data) {
  try {
    if (!Array.isArray(data)) {
      throw new Error("Data must be an array of tasks");
    }
    await writeFile(DB_PATH, JSON.stringify({ tasks : data }, null, 2));
  } catch (e) {
    console.error('Error writing tasks file:', e);
  }
}

//fetching all tasks.
const getAllTasks = async (req, res) => {
    try {
        const data = await readTask();
        if(!data){
            throw new Error("Failed to read task List")
        }
        return await res.json(data);
    } catch (e) {
        res.status(500).json({ error: `Failed to read tasks ${e}`});
    }
};

const addNewTask = async (req, res) => {
    try {
        const {taskData} = req.body;

        const newTask = {
            id: new Date().getTime(),
            ...taskData,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        const tasks = await readTask();
        tasks.push(newTask);
        await writeTask(tasks);
        res.status(201).json();
    }
    catch (e) {
        res.status(500).json({ error: `Failed to add new task, ${e}` });
    }
}

const updateCompletionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing task ID" });

    const tasks = await readTask();
    let isFound = false;

    for (let t of tasks) {
      if (String(t.id) === String(id)) {
        t.completed = !t.completed;
        isFound = true;
        break;
      }
    }

    if (!isFound) return res.status(404).json({ error: "Task not found" });

    await writeTask(tasks);
    return res.status(200).json({ message: "completed" });
  } catch (e) {
    res.status(500).json({ error: `Failed to update completion status: ${e.message}` });
  }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const tasks = await readTask();
        let isFound = false;

        const {task, preference, dateTime, tags, completed} = req.body;

        for (let t of tasks) {
            if (id === String(t.id)) {
                isFound = true;
                t.task = task;
                t.preference = preference;
                // t.dateTime = dateTime;
                t.tags = tags;
                t.completed = completed;
                t.updatedAt = new Date().toISOString();
            }
        }
        if (!isFound) return res.status(404).json({ error: `Task not found` });
        await writeTask(tasks);
        res.status(200).json({ success: `task updated successfully!` });
    }
    catch (e) {
        res.status(500).json({ error: `failed to update task. , ${e}` })
    }
}

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        let tasks = await readTask();
        const len = tasks.length;
       
        tasks = tasks.filter((t) => String(t.id) !== id);

        if (tasks.length === len) {
            return res.status(404).json({ error: `task to be deleted not found` });
        }
        await writeTask(tasks);
        res.status(204).json({ message: `task deleted successfully!` });
    }
    catch (e) {
        res.status(500).json({ error: `failed to delete task, ${e}` })
    }
}

const updateSortedTasks = async (req, res) =>{
    try{
        const {sortedTasks} = req.body;
        await writeTask(sortedTasks);
        res.status(200).json({ message: `tasks sorted successfully!` });
    } catch(e){
        res.status(500).json({error: `failed to sort task, ${e}`});
    }
}

export { getAllTasks, addNewTask, updateCompletionStatus, updateTask, deleteTask , updateSortedTasks };
