import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ConfirmationDialog from "../components/ConfirmationDialog";
import TaskForm from "../components/TaskForm";
import Textarea from "../components/Textarea";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { taskService } from "../services/taskService";
import { userService } from "../services/userService";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { formatDate, formatDateTime } from "../utils/format";

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([taskService.get(id), userService.list()])
      .then(([taskData, usersData]) => {
        setTask(taskData);
        setUsers(usersData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    try {
      await taskService.update(id, payload);
      notify("Task updated.");
      setEditOpen(false);
      load();
    } catch (err) {
      notify(err.message, { type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await taskService.remove(id);
      notify("Task deleted.");
      navigate("/tasks");
    } catch (err) {
      notify(err.message, { type: "error" });
      setSubmitting(false);
    }
  };

  const handleQuickStatus = async (status) => {
    try {
      await taskService.update(id, { status });
      notify("Status updated.");
      load();
    } catch (err) {
      notify(err.message, { type: "error" });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentSubmitting(true);
    try {
      await taskService.addComment(id, { comment: commentText.trim() });
      setCommentText("");
      load();
    } catch (err) {
      notify(err.message, { type: "error" });
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading task…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!task) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          to="/tasks"
          className="text-sm text-ink-600 hover:text-accent-dark"
        >
          ← Back to tasks
        </Link>
      </div>

      <div className="bg-white border border-ink-200 rounded-xl shadow-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {task.is_overdue && (
                <span className="text-xs font-medium text-rose bg-rose/10 border border-rose/30 rounded-full px-2.5 py-1">
                  Overdue
                </span>
              )}
            </div>
            <h1 className="font-display font-semibold text-2xl text-ink-900">
              {task.title}
            </h1>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </div>

        <p className="text-sm text-ink-700 mt-4 whitespace-pre-wrap">
          {task.description || (
            <span className="text-ink-600 italic">
              No description provided.
            </span>
          )}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-ink-100">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-600 font-medium">
              Assignee
            </p>
            <p className="text-sm text-ink-900 mt-1">
              {task.assignee_name || "Unassigned"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-600 font-medium">
              Due date
            </p>
            <p className="text-sm text-ink-900 mt-1 font-mono">
              {formatDate(task.due_date)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-600 font-medium">
              Created
            </p>
            <p className="text-sm text-ink-900 mt-1 font-mono">
              {formatDate(task.created_at)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-600 font-medium">
              Last updated
            </p>
            <p className="text-sm text-ink-900 mt-1 font-mono">
              {formatDate(task.updated_at)}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-6 pt-6 border-t border-ink-100">
          <p className="text-xs uppercase tracking-wide text-ink-600 font-medium self-center mr-2">
            Quick status
          </p>
          {["pending", "in_progress", "completed", "blocked"].map((s) => (
            <button
              key={s}
              onClick={() => handleQuickStatus(s)}
              disabled={task.status === s}
              className="disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <StatusBadge status={s} />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-ink-200 rounded-xl shadow-card p-6">
        <h2 className="font-display font-semibold text-ink-900 mb-4">
          Comments & notes{" "}
          {task.comments.length > 0 && `(${task.comments.length})`}
        </h2>

        {task.comments.length === 0 ? (
          <p className="text-sm text-ink-600 italic">
            No comments yet. Be the first to leave a note.
          </p>
        ) : (
          <ul className="space-y-4 mb-6">
            {task.comments.map((c) => (
              <li key={c.id} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-accent/15 text-accent-dark flex items-center justify-center text-xs font-semibold font-display shrink-0">
                  {c.author_name?.charAt(0) || "?"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-medium text-ink-900">
                      {c.author_name || "Unknown user"}
                    </p>
                    <p className="text-xs text-ink-600 font-mono">
                      {formatDateTime(c.created_at)}
                    </p>
                  </div>
                  <p className="text-sm text-ink-700 mt-0.5 whitespace-pre-wrap">
                    {c.comment}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={handleAddComment}
          className="flex gap-3 items-start pt-4 border-t border-ink-100"
        >
          <Textarea
            className="flex-1"
            rows={2}
            placeholder="Add a comment or note…"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            aria-label="Add a comment"
          />
          <Button
            type="submit"
            loading={commentSubmitting}
            disabled={!commentText.trim()}
          >
            Post
          </Button>
        </form>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit task"
        size="lg"
      >
        <TaskForm
          initialTask={task}
          users={users}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          submitting={submitting}
        />
      </Modal>

      <ConfirmationDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete this task?"
        message={`"${task.title}" and all of its comments will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete task"
        loading={submitting}
      />
    </div>
  );
}
