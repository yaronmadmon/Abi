/**
 * Task Form Component
 * Create and edit tasks
 */

import { useState } from 'react';
import { TaskFormData } from '@/types/tasks';
import { TaskPriority } from '@/models';
import './TaskForm.css';

interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Create Task',
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(
    initialData?.priority || TaskPriority.MEDIUM
  );
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    const formData: TaskFormData = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      assignedToIds: [], // Will be handled separately
      dueDate: dueDate || undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="task-form__field">
        <label htmlFor="task-title" className="task-form__label">
          Title
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="task-form__input"
          placeholder="What needs to be done?"
          required
          autoFocus
        />
      </div>

      <div className="task-form__field">
        <label htmlFor="task-description" className="task-form__label">
          Description (optional)
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="task-form__textarea"
          placeholder="Add any additional details..."
          rows={3}
        />
      </div>

      <div className="task-form__row">
        <div className="task-form__field">
          <label htmlFor="task-priority" className="task-form__label">
            Priority
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="task-form__select"
          >
            <option value={TaskPriority.LOW}>Low</option>
            <option value={TaskPriority.MEDIUM}>Medium</option>
            <option value={TaskPriority.HIGH}>High</option>
            <option value={TaskPriority.URGENT}>Urgent</option>
          </select>
        </div>

        <div className="task-form__field">
          <label htmlFor="task-due-date" className="task-form__label">
            Due Date (optional)
          </label>
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="task-form__input"
          />
        </div>
      </div>

      <div className="task-form__field">
        <label htmlFor="task-tags" className="task-form__label">
          Tags (optional, comma-separated)
        </label>
        <input
          id="task-tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="task-form__input"
          placeholder="home, work, urgent"
        />
      </div>

      <div className="task-form__actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="task-form__button task-form__button--cancel"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="task-form__button task-form__button--submit"
          disabled={!title.trim()}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
