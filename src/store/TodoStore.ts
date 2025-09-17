import { makeAutoObservable } from 'mobx';
import { nanoid } from 'nanoid';

export interface TodoNode {
  id: string;
  title: string;
  completed: boolean;
  children: TodoNode[];
}

interface FindResult {
  node: TodoNode;
  parent: TodoNode | null;
  siblings: TodoNode[];
  depth: number;
  index: number;
}

export class TodoStore {
  items: TodoNode[] = [];
  readonly maxDepth = 2;
  draggingId: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.items = [
      {
        id: nanoid(),
        title: 'Проект',
        completed: false,
        children: [
          {
            id: nanoid(),
            title: 'Определить цели',
            completed: false,
            children: [],
          },
          {
            id: nanoid(),
            title: 'Собрать команду',
            completed: false,
            children: [
              {
                id: nanoid(),
                title: 'Назначить ответственных',
                completed: false,
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: nanoid(),
        title: 'Подготовить демо',
        completed: false,
        children: [],
      },
    ];
  }

  addItem(parentId: string | null, title = 'Новая задача') {
    if (!this.canAddChild(parentId)) {
      return null;
    }

    const targetList = parentId ? this.findNode(parentId)?.node.children : this.items;
    if (!targetList) {
      return null;
    }

    const newNode: TodoNode = {
      id: nanoid(),
      title,
      completed: false,
      children: [],
    };

    targetList.push(newNode);
    return newNode;
  }

  canAddChild(parentId: string | null) {
    if (parentId === null) {
      return true;
    }

    const depth = this.getDepth(parentId);
    if (depth === null) {
      return false;
    }

    return depth < this.maxDepth;
  }

  toggleCompleted(id: string) {
    const found = this.findNode(id);
    if (!found) {
      return;
    }

    found.node.completed = !found.node.completed;
  }

  updateTitle(id: string, title: string) {
    const found = this.findNode(id);
    if (!found) {
      return;
    }

    const next = title.trim();
    found.node.title = next.length ? next : 'Без названия';
  }

  deleteItem(id: string) {
    const found = this.findNode(id);
    if (!found) {
      return;
    }

    found.siblings.splice(found.index, 1);
  }

  startDragging(id: string) {
    this.draggingId = id;
  }

  endDragging() {
    this.draggingId = null;
  }

  canMove(id: string, newParentId: string | null) {
    if (!id || newParentId === id) {
      return false;
    }

    const source = this.findNode(id);
    if (!source) {
      return false;
    }

    const parentResult = newParentId ? this.findNode(newParentId) : null;
    if (newParentId && !parentResult) {
      return false;
    }

    const parentDepth = parentResult ? parentResult.depth : -1;
    if (parentDepth + 1 > this.maxDepth) {
      return false;
    }

    if (newParentId && this.contains(source.node, newParentId)) {
      return false;
    }

    const subtreeDepth = this.getSubtreeDepth(source.node);
    if (parentDepth + 1 + subtreeDepth > this.maxDepth) {
      return false;
    }

    return true;
  }

  moveItem(id: string, newParentId: string | null, index: number) {
    if (!this.canMove(id, newParentId)) {
      return;
    }

    const source = this.findNode(id);
    if (!source) {
      return;
    }

    const parentResult = newParentId ? this.findNode(newParentId) : null;
    const targetSiblings = parentResult ? parentResult.node.children : this.items;
    if (!targetSiblings) {
      return;
    }

    const { siblings, index: currentIndex, node } = source;

    siblings.splice(currentIndex, 1);

    let targetIndex = index;
    if (siblings === targetSiblings && currentIndex < index) {
      targetIndex = index - 1;
    }

    if (targetIndex < 0) {
      targetIndex = 0;
    }
    if (targetIndex > targetSiblings.length) {
      targetIndex = targetSiblings.length;
    }

    targetSiblings.splice(targetIndex, 0, node);
  }

  private findNode(
    id: string,
    nodes = this.items,
    parent: TodoNode | null = null,
    depth = 0,
  ): FindResult | null {
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      if (node.id === id) {
        return { node, parent, siblings: nodes, depth, index };
      }

      const result = this.findNode(id, node.children, node, depth + 1);
      if (result) {
        return result;
      }
    }

    return null;
  }

  private getDepth(id: string) {
    const found = this.findNode(id);
    return found ? found.depth : null;
  }

  private getSubtreeDepth(node: TodoNode): number {
    if (node.children.length === 0) {
      return 0;
    }

    return 1 + Math.max(...node.children.map((child) => this.getSubtreeDepth(child)));
  }

  private contains(node: TodoNode, id: string): boolean {
    if (node.id === id) {
      return true;
    }

    return node.children.some((child) => this.contains(child, id));
  }
}
