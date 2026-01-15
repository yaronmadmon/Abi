/**
 * To Do Modal Component
 * Modal wrapper for the To Do List
 */

import { ToDoList, Todo } from './ToDoList';
import './ToDoModal.css';

interface ToDoModalProps {
  todos: Todo[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onClose: () => void;
}

export function ToDoModal({ todos, onAddTodo, onToggleTodo, onDeleteTodo, onClose }: ToDoModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="todo-modal" onClick={handleBackdropClick}>
      <div className="todo-modal__content">
        <ToDoList
          todos={todos}
          onAddTodo={onAddTodo}
          onToggleTodo={onToggleTodo}
          onDeleteTodo={onDeleteTodo}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
