import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import MetricCard from "../components/MetricCard";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

import { dashboardService } from "../services/dashboardService";
import { taskService } from "../services/taskService";
import { externalService } from "../services/externalService";

import { useAuth } from "../context/AuthContext.jsx";
import { formatDate } from "../utils/format";

export default function Dashboard() {
  const { user: currentUser, loading: userLoading } = useAuth();
  const currentUserId = currentUser?.id;
  const userError = null;

  const [metrics, setMetrics] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [tip, setTip] = useState(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * Load all dashboard data
   */
  const load = useCallback(async () => {
    console.log("Dashboard loading for user:", currentUserId);

    // User information is still loading
    if (userLoading) {
      console.log("Waiting for current user...");
      return;
    }

    // User API failed
    if (userError) {
      console.error("Current user error:", userError);

      setError(userError);
      setLoading(false);
      return;
    }

    // No user available
    if (!currentUserId) {
      console.error("No current user ID available.");

      setError("No current user found. Please make sure users are available.");

      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Fetching dashboard data for user:", currentUserId);

      const [dashboardData, tasksData, tipData] = await Promise.all([
        dashboardService.get(),

        taskService.list({
          assignee: "me",
          sortBy: "due_date",
          sortDir: "asc",
          limit: 5,
        }),

        externalService.getDailyTip().catch((err) => {
          console.warn("Daily tip failed:", err);

          return null;
        }),
      ]);

      console.log("Dashboard API response:", dashboardData);

      console.log("Tasks API response:", tasksData);

      console.log("Daily tip response:", tipData);

      setMetrics(dashboardData);

      setMyTasks(tasksData?.items || []);

      setTip(tipData);
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(err?.message || "Failed to load dashboard.");

      setMetrics(null);
      setMyTasks([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, currentUser, userLoading, userError]);

  /*
   * Wait until CurrentUserProvider has
   * finished loading the current user.
   */
  useEffect(() => {
    if (userLoading) {
      return;
    }

    load();
  }, [userLoading, load]);

  /*
   * Show loading while current user
   * information is being loaded.
   */
  if (userLoading) {
    return <LoadingState label="Loading user..." />;
  }

  /*
   * Show error if user loading failed.
   */
  if (userError) {
    return <ErrorState message={userError} onRetry={load} />;
  }

  /*
   * Show dashboard loading state.
   */
  if (loading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  /*
   * Show dashboard error.
   */
  if (error) {
    return <ErrorState message={error} onRetry={load} />;
  }

  /*
   * No dashboard metrics.
   */
  if (!metrics) {
    return (
      <ErrorState message="Dashboard data is not available." onRetry={load} />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink-900">
          Dashboard
        </h1>

        <p className="text-sm text-ink-600 mt-1">
          A snapshot of what the team is working on right now.
        </p>

        {currentUser && (
          <p className="text-xs text-ink-500 mt-2">
            Acting as:{" "}
            <span className="font-medium text-ink-700">
              {currentUser.name ||
                currentUser.full_name ||
                currentUser.email ||
                `User ${currentUser.id}`}
            </span>
          </p>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard label="Total" value={metrics.total_tasks ?? 0} tone="ink" />

        <MetricCard
          label="Pending"
          value={metrics.pending_tasks ?? 0}
          tone="ink"
        />

        <MetricCard
          label="In Progress"
          value={metrics.in_progress_tasks ?? 0}
          tone="accent"
        />

        <MetricCard
          label="Completed"
          value={metrics.completed_tasks ?? 0}
          tone="emerald"
        />

        <MetricCard
          label="Overdue"
          value={metrics.overdue_tasks ?? 0}
          tone="rose"
        />

        <MetricCard
          label="Assigned to Me"
          value={metrics.my_tasks ?? 0}
          tone="amber"
        />
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming tasks */}
        <div className="lg:col-span-2 bg-white border border-ink-200 rounded-xl shadow-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200">
            <h2 className="font-display font-semibold text-ink-900">
              My upcoming tasks
            </h2>

            <Link
              to="/tasks"
              className="text-sm text-accent-dark hover:underline"
            >
              View all
            </Link>
          </div>

          {myTasks.length === 0 ? (
            <p className="text-sm text-ink-600 px-5 py-8 text-center">
              Nothing assigned to you right now. Enjoy the quiet.
            </p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {myTasks.map((task) => (
                <li
                  key={task.id}
                  className="px-5 py-3 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="text-sm font-medium text-ink-900 hover:text-accent-dark truncate block"
                    >
                      {task.title}
                    </Link>

                    <p className="text-xs text-ink-600 font-mono mt-0.5">
                      Due{" "}
                      {task.due_date
                        ? formatDate(task.due_date)
                        : "No due date"}
                      {task.is_overdue && (
                        <span className="text-rose ml-1">· overdue</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <PriorityBadge priority={task.priority} />

                    <StatusBadge status={task.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Priority breakdown */}
        <div className="bg-white border border-ink-200 rounded-xl shadow-card p-5 flex flex-col">
          <h2 className="font-display font-semibold text-ink-900 mb-3">
            Priority breakdown
          </h2>

          <div className="space-y-3 flex-1">
            {Object.entries(metrics.tasks_by_priority || {}).map(
              ([priority, count]) => {
                const total = Number(metrics.total_tasks) || 0;

                const pct =
                  total > 0 ? Math.round((Number(count) / total) * 100) : 0;

                return (
                  <div key={priority}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <PriorityBadge priority={priority} />

                      <span className="font-mono text-ink-600">{count}</span>
                    </div>

                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{
                          width: `${pct}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>

          {/* Completion rate */}
          <div className="mt-4 pt-4 border-t border-ink-100">
            <p className="text-xs text-ink-600 uppercase tracking-wide font-medium">
              Completion rate
            </p>

            <p className="font-mono text-2xl text-ink-900 mt-1">
              {metrics.completion_rate ?? 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Daily tip */}
      {tip && (
        <div className="bg-ink-950 text-white rounded-xl shadow-card px-5 py-4 flex items-start gap-3">
          <span className="font-mono text-accent-light text-lg leading-none">
            ”
          </span>

          <div>
            <p className="text-sm">{tip.content}</p>

            <p className="text-xs text-white/50 mt-1">
              — {tip.author}
              {tip.is_fallback && " (offline tip)"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
