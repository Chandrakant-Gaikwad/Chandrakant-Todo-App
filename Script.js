let tasks = JSON.parse(localStorage.getItem("bigTasks")) || [];
let filter = "all";
let pendingSaveIndex = null;

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const prioritySelect = document.getElementById("prioritySelect");
const taskCount = document.getElementById("taskCount");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter");

function saveTasks() {
  localStorage.setItem("bigTasks", JSON.stringify(tasks));
}

function updateCount() {
  const count = tasks.filter(task => !task.completed).length;
  taskCount.textContent = `${count} active task${count !== 1 ? 's' : ''}`;
}

function renderTasks() {
  taskList.innerHTML = "";

  const visibleTasks = tasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `task ${task.priority} ${task.completed ? "completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.tempCompleted ?? task.completed;
    checkbox.addEventListener("change", () => {
      task.tempCompleted = checkbox.checked;
      pendingSaveIndex = index;
      renderTasks(); // re-render to show Save button
    });

    const span = document.createElement("span");
    span.textContent = task.text;
    span.title = "Double-click to edit";
    span.addEventListener("dblclick", () => editTask(index));

    const time = document.createElement("small");
    time.className = "timestamp";
    time.textContent = task.time;

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => deleteTask(index));

    li.append(checkbox, span, time, delBtn);

    if (pendingSaveIndex === index) {
      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";
      saveBtn.className = "save-btn";
      saveBtn.addEventListener("click", () => {
        task.completed = !!task.tempCompleted;
        delete task.tempCompleted;
        pendingSaveIndex = null;
        saveTasks();
        renderTasks();
      });
      li.appendChild(saveBtn);
    }

    taskList.appendChild(li);
  });

  updateCount();
}

function addTask() {
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;

  if (!text) return;

  const now = new Date();
  const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;

  tasks.push({ text, priority, completed: false, time });
  taskInput.value = "";
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function editTask(index) {
  const newText = prompt("Edit task:", tasks[index].text);
  if (newText !== null && newText.trim() !== "") {
    tasks[index].text = newText.trim();
    saveTasks();
    renderTasks();
  }
}

addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => {
  if (e.key === "Enter") addTask();
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
});

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter.active")?.classList.remove("active");
    btn.classList.add("active");
    filter = btn.dataset.filter;
    renderTasks();
  });
});

renderTasks();
