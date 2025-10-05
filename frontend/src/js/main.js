// Import our custom CSS
import "../scss/styles.scss";

// Import all of Bootstrap’s JS
import * as bootstrap from "bootstrap";

//declaring btn, tasklist and predefined style for functional btns.
const addBtn = document.querySelector("#addBtn");
const taskList = document.querySelector("#taskList");
const functionalBtns = `<div class="functional-btns">
<img class="del-btn" src="./assets/svg/delete.svg" alt="delete-img">
<img class="edit-btn" src="./assets/svg/pencil.svg" alt = "edit-img">
</div>`;

const confirmBox = document.querySelector(".confirm-box");
const confirmMsgBox = document.querySelector(".confirm-msg-box");
const ul = document.querySelector("#taskList");

const taskBox = document.querySelector("#taskInput");
const preferenceBox = document.querySelector("#preferenceInput");
const tagsBox = document.querySelector(".tags-input");
const dateTimeBox = document.querySelector("#dateTimeInput");
const sortInput = document.querySelector("#sortInput");

const alertBox = document.querySelector(".alert-box");
const messageBox = document.querySelector(".message");
const searchBox = document.querySelector('#searchInput');


//loading data in the local Storage.
window.onload = async function () {
  let tasks = await getTaskList();
  // sorting(tasks);
  createFunctionalBtns();
  displayTask(tasks);
};

//searching.
searchBox.addEventListener("input", async () => {
  const searchValue = searchBox.value.toLowerCase(); // make case-insensitive
  const tasks = await getTaskList(); // fetch all tasks

  // filter tasks whose `task` contains searchValue
  const filteredTasks = tasks.filter(t =>
    t.task.toLowerCase().includes(searchValue)
  );

  displayTask(filteredTasks); // show only matching tasks
});

//making the list buttons functional.
async function createFunctionalBtns() {
  //deleting task.
  ul.addEventListener("click", async (e) => {
    try {
      if (e.target.classList.contains("del-btn")) {
        console.log("delete btn clicked");
        const result = await showConfirmBox("Do you want to delete the task?");
        if (result === "yes") {
          confirmMsgBox.innerText = "";
          confirmBox.classList.remove("down");
          const listItem = e.target.closest("li");
          const deleteId = listItem.id;
          
          await deleteTask(deleteId);
          const tasks = getTaskList();
          displayTask(tasks);
          showAlert("Task Deleted Successfully!", "success");
        }
      }
    } catch (e) {
      console.log("something went wrong while deleting.");
    }
  });


  //task done
  ul.addEventListener("click", async (e) => {
    if (e.target.classList.contains("done-btn")) {
      const listItem = e.target.closest("li");
      const taskText = listItem.querySelector("p");
      const doneBtn = e.target;
      const id = listItem.id;
      const tasks = await getTaskList();

      const isCompleted = e.target.textContent.includes("Undone");
      console.log(isCompleted);
      // save updates
      await updateCompletionStatus(id, isCompleted);
      updateAnalyticBox(tasks);
      displayTask(tasks);
    }
  });


  //edit Btn
  ul.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-btn")) {
      console.log("inside edit button")
      const listItem = e.target.closest("li");
      const id = listItem.id;

      const data = await getTaskList();
      const tasks = data.tasks;
      let taskData = null;

      tasks.forEach((task) => {
        if (id === String(task.id)) {
          taskData = task;
        }
      });

      if (taskData) {
        taskBox.value = taskData.task;
        preferenceBox.value = taskData.preference;
        // dateTimeBox.value = taskData.dateTime;
        tagsBox.value = taskData.tags;

        taskBox.style.background = "beige";
        taskBox.style.border = "2px solid #81290cff";

        preferenceBox.style.background = "beige";
        preferenceBox.style.border = "2px solid #81290cff";

        dateTimeBox.style.background = "beige";
        dateTimeBox.style.border = "2px solid #81290cff";

        tagsBox.style.background = "beige";
        tagsBox.style.border = "2px solid #81290cff";

        const addTaskContainer = document.querySelector('.addTask-container');
        const existing = document.querySelector('.btn-row');
        if(!existing){
          const newDiv = document.createElement('div');
          newDiv.classList.add('row');
          newDiv.classList.add('g-3');
          newDiv.classList.add('pt-3');
          newDiv.classList.add('btn-row');

          newDiv.innerHTML = `<div class="col-md-6 d-grid">
            <button id="save-btn" class="btn primary-btn btn-brown">
              Save
            </button>
          </div>

          <div class="col-md-6 d-grid">
            <button id="cancel-btn" class="btn primary-btn btn-brown">
              Cancel
            </button>
          </div>`;
          addTaskContainer.insertAdjacentElement('afterend', newDiv);

          const saveBtn = document.querySelector('#save-btn');
          const cancelBtn = document.querySelector('#cancel-btn');

          saveBtn.addEventListener('click', () => {
            const preferenceInput = preferenceBox.value;
            const taskInput = taskBox.value.trim();
            const dateTimeInput = dateTimeBox ? dateTimeBox.value : null;
            const tagsInput = tagsBox.value;
            const tagsInputArray = tagsInput ? tagsInput.split(",") : [];

            const updatedData = {
              task: taskInput,
              preference: preferenceBox,
              dateTime: dateTimeInput,
              tags: tagsInputArray,
            }
            updateTask(id, updatedData);
            restoreInputBoxes();
            newDiv.remove();
            displayTask(tasks);
          });

          cancelBtn.addEventListener('click', () => {
            restoreInputBoxes();
            newDiv.remove();
          });
        }
      }
    }
  });
}

//emptying all the boxes after adding input.
// function restoreInputBoxes(){
//   taskBox.value = "";
//   preferenceBox.value = "";
//   dateTimeBox.value = "";
//   tagsBox.value = "";
  
//   taskBox.style.background = "white";
//   taskBox.style.border = "none";
  
//   preferenceBox.style.background = "white";
//   preferenceBox.style.border = "none";
  
//   dateTimeBox.style.background = "white";
//   dateTimeBox.style.border = "none";
  
//   tagsBox.style.background = "white";
//   tagsBox.style.border = "none";
// }

//Adding new List.
addBtn.addEventListener("click", async () => {
  const preferenceInput = preferenceBox.value;
  const taskInput = taskBox.value.trim();
  const dateTimeInput = dateTimeBox ? dateTimeBox.value : null;
  const tagsInput = tagsBox.value;
  const tagsInputArray = tagsInput ? tagsInput.split(",") : [];

  if (taskInput === "") {
    showAlert("Please enter the task!", "error");
    return;
  }

  if (preferenceInput === "") {
    showAlert("Please select preference!", "error");
    return;
  }

  if (dateTimeInput) {
    const inputDate = new Date(dateTimeInput + ":00");
    const now = new Date();

    if (inputDate < now) {
      showAlert("Selected time cannot be in the past.", "error");
      return;
    }
  }

  //adding task.
  const taskData = {
    id: new Date().getTime(),
    task: taskInput,
    preference: preferenceInput,
    dateTime: dateTimeInput ? new Date(dateTimeInput).toISOString() : null,
    tags: tagsInputArray,
    completed: false,
  };

  await storeTask(taskData);
  let tasks = await getTaskList();
  // sorting(tasks);
  showAlert("Task added successfully!", "success");

  //Reset values.
  taskBox.value = "";
  preferenceBox.value = "";
  dateTimeBox.value = "";
  tagsBox.value = "";

  return;
});

//showing Alert message.
function showAlert(message, method) {
  messageBox.innerText = message;
  // remove any previous state first
  alertBox.classList.remove("success", "error", "show");
  // add new state
  alertBox.classList.add("show", method === "success" ? "success" : "error");
  setTimeout(() => {
    alertBox.classList.remove("success", "error", "show");
  }, 3000);
}

//showing confirmation box.
function showConfirmBox(message) {
  confirmMsgBox.innerHTML = message; //adding msg to confirm box
  confirmBox.classList.add("up");

  return new Promise((resolve) => {
    const yesBtn = document.querySelector(".yes-btn");
    const noBtn = document.querySelector(".no-btn");

    yesBtn.onclick = () => {
      confirmBox.classList.remove("up");
      confirmBox.classList.add("down");
      resolve("yes");
    };
    noBtn.onclick = () => {
      confirmBox.classList.remove("up");
      confirmBox.classList.add("down");
      resolve("no");
    };
  });
}

//sorting on the basis of Time.
// function sortByTime(tasks) {
//   tasks.sort((a, b) => {
//     const aTime = a.dateTime ? new Date(a.dateTime).getTime() : Infinity;
//     const bTime = b.dateTime ? new Date(b.dateTime).getTime() : Infinity;
//     return aTime - bTime; // earlier time first
//   });
//   return tasks;
// }

//sorting on the basis of preference.
// function sortByPreference(tasks) {
//   const preferenceOrder = {
//     High: 1,
//     Medium: 2,
//     Low: 3
//   };

//   tasks.sort((a, b) => {
//     const aPref = preferenceOrder[a.preference] || 4;
//     const bPref = preferenceOrder[b.preference] || 4;
//     return aPref - bPref;
//   });
//   return tasks;
// }

//no sorting applied.
// function sortByIndex(tasks) {
//   tasks.sort((a, b) => {
//     return Number(a.id) - Number(b.id);
//   });
//   return tasks;
// }

// function sorting(tasks) {
//   console.log("this is tasks inside sorting", tasks);
//   const sortValue = sortInput.value;

//   if (sortValue === "time") {
//     tasks = sortByTime(tasks);
//   } else if (sortValue === "preference") {
//     tasks = sortByPreference(tasks);
//   } else {
//     tasks = sortByIndex(tasks);
//   }

//   //either save it in the database.
//   sortAndSaveTask(tasks);
//   displayTask(tasks);
// }

// sortInput.addEventListener("change", sorting);

//adding task to database..
async function storeTask(taskData) {
  try {
    const res = await fetch('http://localhost:8000/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: new Date().getTime(),
        task: taskData.task,
        preference: taskData.preference,
        dateTime: taskData.dateTime,
        tags: taskData.tags,
        completed: false,
      })
    });
    if (!res.ok) throw new Error('Failed to create task');
    showAlert('Task added successfully!', 'success');
  } catch (e) {
    console.error('Error creating task:', e);
    showAlert('Could not add task to server', 'error');
  }
}

//removing task from database.
// async function deleteTask(id) {
//   try{
//     const res = await fetch(`http://localhost:8000/${id}`, {
//       method:'DELETE'
//     });
//     if(!res.ok)throw new Error("Failed to delete task");
//     showAlert('Task deleted successfully!', 'success');
//   }
//   catch(e){
//     console.error('Error deleting task:', e);
//     showAlert('Could not delete task from server', 'error');
//   }
// }

//displaying tasks.
function displayTask(tasks) {
  console.log("inside display tasks");

  const ul = document.querySelector("#taskList");
  ul.innerHTML = ""; //empty the container before adding the values again.

  tasks.forEach((t) => {
    const newLi = document.createElement("li");
    let textStyle = 'none'

    if (t.completed === true) {
      textStyle = 'line-through';
    }

    let preferenceColor = "black"; // default color
    if (t.preference.toLowerCase() === "high") {
      preferenceColor = "red";
    } else if (t.preference.toLowerCase() === "medium") {
      preferenceColor = "yellow";
    } else if (t.preference.toLowerCase() === "low") {
      preferenceColor = "green";
    }

    newLi.innerHTML = `
  <div class="list-container d-flex align-items-center justify-content-between">
    <div class="data-container d-flex gap-2 align-items-center">
      <div class="preference-container p-1 rounded-1" style="background:${preferenceColor}">${t.preference}</div>
      <div class="time-container">${t.dateTime ? new Date(t.dateTime).toLocaleString() : ''}</div>
      <p class="m-0" style="text-decoration: ${textStyle}">${t.task}</p>
      <div class="tags-container">${t.tags.join(" ")}</div>
    </div>

    <div class="btn-container">
     <button class="btn primary-btn done-btn">
        ${t.completed === true ? 'Undone' : 'Done'}
      </button>

      ${functionalBtns}
    </div>
  </div>`;

    console.log(t.dateTime);
    console.log(t.tags);

    newLi.id = t.id;
    ul.appendChild(newLi);
  });

  updateAnalyticBox(tasks);
}

//extracting taskList from database.
async function getTaskList() {
  try{
    const res = await fetch('http://localhost:8000/');
    if(!res.ok) throw new Error("Failed to fetch tasks");
    console.log("this is the response from res.ok" ,res);
    return await res.json();
  }
  catch(e){
    console.error('error in fetching tasks:', e);
    showAlert('Could not load tasks from server', 'error');
  }
}

// async function updateTask(id, updatedData){
//   try{
//     const res = await fetch(`http://localhost:8000/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         task: updatedData.task,
//         preference: updatedData.preference,
//         tags: updatedData.tags,
//         completed: updatedData.completed,
//       })
//     });

//     if (!res.ok) throw new Error('Failed to update task');
//     showAlert('Task updated successfully!', 'success');
//     return;
//   }
//   catch(e){
//     console.error('Error updating task:', e);
//     showAlert('Could not update task on server', 'error');
//   }
// }

//changing only a single value.
// async function updateCompletionStatus(id, completed) {
//   try {
//     const res = await fetch(`http://localhost:8000/${id}`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ completed })
//     });

//     if (!res.ok) throw new Error('Failed to update completion status');
//     showAlert('Task status updated!', 'success');
//   } catch (e) {
//     console.error('Error updating completion status:', e);
//     showAlert('Could not update task status', 'error');
//   }
// }

//updating the analytics.
// function updateAnalyticBox(tasks) {
//   const total = tasks.length;
//   const completed = tasks.filter(t => t.completed === true).length;
//   const pending = total - completed;

//   document.querySelector(".total-tasks").innerText = total;
//   document.querySelector(".completed-tasks").innerText = completed;
//   document.querySelector(".pending-tasks").innerText = pending;
// }

// async function sortAndSaveTask(sortedTasks) {
//   try {
//     const response = await fetch('http://localhost:8000/sort', {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ sortedTasks }),
//     });

//     if (!response.ok) {
//       throw new Error('Failed to save sorted tasks');
//     }
//   } catch (e) {
//     console.error('Error saving sorted tasks:', e);
//   }
// }
