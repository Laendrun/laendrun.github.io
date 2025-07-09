class TaskManager {
  constructor(containerId) {
    this.db = null;
    this.storeName = 'tasks';
    this.init();
    this.order = ['todo', 'progress', 'done'];
    this.statusMap = {
      todo: '- [ ] ',
      progress: '- [/] ',
      done: '- [X] ',
    };
    this.container = document.getElementById(containerId);
  }

  init() {
    const request = indexedDB.open('taskdb', 1);

    request.onerror = () => console.error('Failed to open DB');
    request.onsuccess = () => {
      this.db = request.result;
      this.loadTasks().then((tasks) => {
        this.tasks = tasks;
        this.onready?.();
      });
    };

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };
  }

  render() {
    this.container.innerHTML = '';

    const tasks = this.getAll();

    tasks.forEach((t) => {
      const li = document.createElement('li');
      li.className = t.status;

      li.innerHTML = t.editing
        ? `
        <span class="task">
          <span class="task-status">${this.statusMap[t.status]}</span>
          <input type="text" class="edit-input" value="${t.content}" />
        </span>
        <span class="task-actions">
          <span>
            <button class="btn" data-action="save" data-index="${t.id}">
              [save]
            </button>
            <button class="btn" data-action="cancel" data-index="${t.id}">
              [cancel]
            </button>
          </span>
        </span>
      `
        : `
        <span class="task">
          <span class="task-status">${this.statusMap[t.status]}</span>
          <span class="task-text">${t.content}</span>
        </span>
        <span class="task-actions">
          <span>
            <button class="btn" data-action="edit" data-index="${t.id}">
              [edit]
            </button>
            <button class="btn" data-action="delete" data-index="${t.id}">
              [delete]
            </button>
          </span>
        </span>

      `;

      if (!t.editing) {
        const taskSpan = li.querySelector('.task');
        taskSpan.addEventListener('click', () => {
          this.cycleStatus(t.id).then(() => this.render());
        });
      }

      this.container.appendChild(li);
      if (t.editing) {
        setTimeout(() => {
          const input = li.querySelector('.edit-input');
          if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
          }
        }, 0);
      }
    });
  }

  async saveTask(task) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.put(task);
      request.onsuccess = () => res();
      request.onerror = () => rej();
    });
  }

  async saveTasks() {
    return new Promise((res, rej) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);

      for (const task of this.tasks) {
        store.put(task);
      }

      tx.oncomplete = async () => {
        this.tasks = await this.loadTasks();
        res();
      };

      tx.onerror = () => rej();
    });
  }

  async loadTasks() {
    return new Promise((res, rej) => {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => res(request.result);
      request.onerror = () => rej([]);
    });
  }

  async addTask(t) {
    const def = { status: 'todo', editing: false };
    const task = { ...def, ...t };

    return new Promise((res, rej) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.add(task);
      request.onsuccess = async () => {
        this.tasks = await this.loadTasks();
        res();
      };
      request.onerror = () => rej();
    });
  }

  async cycleStatus(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;

    const order = this.order;
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    task.status = next;

    await this.saveTask(task);
    this.tasks = await this.loadTasks();
  }

  async editTask(id, newContent) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;
    task.content = newContent;
    await this.saveTask(task);
    this.tasks = await this.loadTasks();
  }

  async deleteTask(id) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.delete(id);
      req.onsuccess = async () => {
        this.tasks = await this.loadTasks();
        res();
      };
      req.onerror = () => rej();
    });
  }

  async toggleEdit(id) {
    // console.log(`Toggling edit for task: ${id}`);
    this.tasks = this.tasks.map((t) => {
      return t.id === id
        ? { ...t, editing: !t.editing }
        : { ...t, editing: false };
    });
    this.saveTasks();
  }

  getAll() {
    return this.tasks || [];
  }
}
