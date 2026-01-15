/**
 * Task Card Component
 * Displays a task with completion and assignment options
 */

import { Task, TaskStatus } from '@/models';
import { formatTaskDueDate, getTaskPriorityColor, isTaskOverdue, isTaskDueSoon } from '@/utils/tasks';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onComplete?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  showAssignees?: boolean;
}

export function TaskCard({ task, onComplete, onEdit, showAssignees = false }: TaskCardProps) {
  const isOverdue = isTaskOverdue(task);
  const isDueSoon = isTaskDueSoon(task);
  const isCompleted = task.status === TaskStatus.COMPLETED;

  const handleComplete = () => {
    if (onComplete && !isCompleted) {
      onComplete(task);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  return (
    <div className={`task-card ${isCompleted ? 'task-card--completed' : ''} ${isOverdue ? 'task-card--overdue' : ''}`}>
      <div className="task-card__header">
        <div className="task-card__priority" style={{ backgroundColor: getTaskPriorityColor(task.priority) }} />
        <h3 className="task-card__title">{task.title}</h3>
        {!isCompleted && (
          <button
            onClick={handleComplete}
            className="task-card__complete"
            aria-label="Mark as complete"
            title="Mark as complete"
          >
            ✓
          </button>
        )}
      </div>

      {task.description && (
        <p className="task-card__description">{task.description}</p>
      )}

      <div className="task-card__footer">
        {task.dueDate && (
          <span className={`task-card__due-date ${isOverdue ? 'task-card__due-date--overdue' : ''} ${isDueSoon ? 'task-card__due-date--soon' : ''}`}>
            {formatTaskDueDate(task.dueDate)}
          </span>
        )}
        {showAssignees && task.assignedToIds.length > 0 && (
          <span className="task-card__assignees">
            {task.assignedToIds.length} assignee{task.assignedToIds.length !== 1 ? 's' : ''}
          </span>
        )}
        {task.tags.length > 0 && (
          <div className="task-card__tags">
            {task.tags.map((tag) => (
              <span key={tag} className="task-card__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        {onEdit && (
          <button
            onClick={handleEdit}
            className="task-card__edit"
            aria-label="Edit task"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
