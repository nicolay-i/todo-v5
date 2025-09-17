import { makeAutoObservable } from 'mobx';

export const MAX_DEPTH = 3;

let idCounter = 0;
const generateId = () => {
  idCounter += 1;
  return `todo-${Date.now()}-${idCounter}`;
};

const normalizeNode = ({ title, completed = false, children = [] }) => ({
  id: generateId(),
  title,
  completed,
  children: children.map(normalizeNode),
});

const initialStructure = [
  {
    title: 'Спланировать неделю',
    children: [
      { title: 'Определить ключевые задачи' },
      { title: 'Выделить время под исследования' },
    ],
  },
  {
    title: 'Подготовить интерфейс',
    children: [
      {
        title: 'Собрать референсы',
        children: [{ title: 'Отметить подходящий стиль' }],
      },
      { title: 'Сверстать макет' },
    ],
  },
];

export class TodoStore {
  todos = [];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.todos = initialStructure.map(normalizeNode);
  }

  getChildren(parentId) {
    if (!parentId) {
      return this.todos;
    }
    const parent = this.findById(parentId);
    if (!parent) {
      return this.todos;
    }
    return parent.children;
  }

  addTodo(parentId, title) {
    if (!title.trim()) {
      return null;
    }
    if (!this.canAddChild(parentId)) {
      return null;
    }
    const todo = normalizeNode({ title: title.trim() });
    const container = this.getChildren(parentId);
    container.push(todo);
    return todo;
  }

  renameTodo(id, title) {
    const todo = this.findById(id);
    if (!todo) {
      return;
    }
    todo.title = title.trim();
  }

  toggleTodo(id) {
    const todo = this.findById(id);
    if (!todo) {
      return;
    }
    const nextState = !todo.completed;
    this.applyCompletion(todo, nextState);
  }

  applyCompletion(todo, value) {
    todo.completed = value;
    todo.children.forEach((child) => this.applyCompletion(child, value));
  }

  deleteTodo(id) {
    const result = this.findWithParent(id);
    if (!result) {
      return;
    }
    const { parent, index } = result;
    const list = parent ? parent.children : this.todos;
    list.splice(index, 1);
  }

  moveTodo(id, targetParentId, targetIndex) {
    const source = this.findWithParent(id);
    if (!source) {
      return false;
    }
    const { item, parent, index } = source;
    const parentDepth = this.getDepthFromParent(targetParentId);
    const subtreeDepth = this.getSubtreeDepth(item);
    if (parentDepth + subtreeDepth > MAX_DEPTH) {
      return false;
    }

    const originList = parent ? parent.children : this.todos;
    // remove from origin
    originList.splice(index, 1);

    const targetList = this.getChildren(targetParentId);
    let insertionIndex = Math.max(0, Math.min(targetIndex, targetList.length));
    if (originList === targetList && index < targetIndex) {
      insertionIndex -= 1;
    }
    insertionIndex = Math.max(0, Math.min(insertionIndex, targetList.length));

    targetList.splice(insertionIndex, 0, item);
    return true;
  }

  canAddChild(parentId) {
    return this.getDepthFromParent(parentId) < MAX_DEPTH;
  }

  getDepth(id) {
    const path = this.getPath(id);
    return path.length;
  }

  getDepthFromParent(parentId) {
    if (!parentId) {
      return 0;
    }
    const parent = this.findById(parentId);
    if (!parent) {
      return 0;
    }
    return this.getDepth(parent.id);
  }

  getSubtreeDepth(node) {
    if (!node.children.length) {
      return 1;
    }
    const depthValues = node.children.map((child) => this.getSubtreeDepth(child));
    return 1 + Math.max(...depthValues);
  }

  getPath(id, nodes = this.todos, currentPath = []) {
    for (const node of nodes) {
      const nextPath = [...currentPath, node];
      if (node.id === id) {
        return nextPath;
      }
      if (node.children.length) {
        const found = this.getPath(id, node.children, nextPath);
        if (found.length) {
          return found;
        }
      }
    }
    return [];
  }

  findById(id) {
    return this.findWithParent(id)?.item ?? null;
  }

  findWithParent(id, nodes = this.todos, parent = null) {
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (node.id === id) {
        return { item: node, parent, index: i };
      }
      if (node.children.length) {
        const result = this.findWithParent(id, node.children, node);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  getIndexWithinParent(id) {
    const result = this.findWithParent(id);
    if (!result) {
      return -1;
    }
    return result.index;
  }
}

export const todoStore = new TodoStore();
