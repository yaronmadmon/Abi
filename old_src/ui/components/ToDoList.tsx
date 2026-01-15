/**
 * To Do List Component
 * Simple, Apple Notes-style todo list
 */

import { useState } from 'react';
import './ToDoList.css';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface ToDoListProps {
  todos: Todo[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onClose?: () => void;
}

export function ToDoList({ todos, onAddTodo, onToggleTodo, onDeleteTodo, onClose }: ToDoListProps) {
  const [newTodoText, setNewTodoText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    
    onAddTodo(newTodoText.trim());
    setNewTodoText('');
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="todo-list">
      {onClose && (
        <div className="todo-list__header">
          <h2 className="todo-list__title">To Do</h2>
          <button
            type="button"
            onClick={onClose}
            className="todo-list__close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="todo-list__form">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="New to-do..."
          className="todo-list__input"
          autoFocus
        />
      </form>

      <div className="todo-list__content">
        {todos.length === 0 ? (
          <div className="todo-list__empty">
            <p className="todo-list__empty-text">No to-dos yet. Add one above!</p>
          </div>
        ) : (
          <>
            {activeTodos.length > 0 && (
              <div className="todo-list__section">
                <ul className="todo-list__items">
                  {activeTodos.map((todo) => (
                    <li key={todo.id} className="todo-list__item">
                      <label className="todo-list__item-content">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => onToggleTodo(todo.id)}
                          className="todo-list__checkbox"
                        />
                        <span className="todo-list__item-text">{todo.text}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => onDeleteTodo(todo.id)}
                        className="todo-list__delete"
                        aria-label="Delete"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {completedTodos.length > 0 && (
              <div className="todo-list__section todo-list__section--completed">
                <h3 className="todo-list__section-title">Completed</h3>
                <ul className="todo-list__items">
                  {completedTodos.map((todo) => (
                    <li key={todo.id} className="todo-list__item todo-list__item--completed">
                      <label className="todo-list__item-content">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => onToggleTodo(todo.id)}
                          className="todo-list__checkbox"
                        />
                        <span className="todo-list__item-text">{todo.text}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => onDeleteTodo(todo.id)}
                        className="todo-list__delete"
                        aria-label="Delete"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
