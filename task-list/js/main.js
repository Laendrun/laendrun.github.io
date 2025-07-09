document.addEventListener('DOMContentLoaded', () => {
  const taskManager = new TaskManager('taskList');
  const input = document.getElementById('newTaskInput');
  const addBtn = document.getElementById('addTaskBtn');

  taskManager.onready = () => {
    taskManager.render(); // initial render

    document.addEventListener('click', async (e) => {
      const dataset = e.target.dataset || null;
      if (dataset?.action === 'delete') {
        await taskManager.deleteTask(parseInt(dataset.index));
        taskManager.render();
      } else if (dataset?.action === 'edit') {
        taskManager.toggleEdit(parseInt(dataset.index));
        taskManager.render();
      } else if (dataset?.action === 'save') {
        const input = document.querySelector('.edit-input');
        const newContent = input.value.trim();
        if (newContent) {
          taskManager.editTask(parseInt(dataset.index), newContent).then(() => {
            taskManager.toggleEdit(parseInt(dataset.index));
            taskManager.render();
          });
        }
      } else if (dataset?.action === 'cancel') {
        taskManager.toggleEdit(parseInt(dataset.index));
        taskManager.render();
      }
    });

    addBtn.addEventListener('click', async () => {
      const value = input.value.trim();
      if (value) {
        const task = { content: value };
        await taskManager.addTask(task);
        input.value = '';
        taskManager.render();
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addBtn.click();
    });
  };
});
