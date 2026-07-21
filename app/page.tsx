"use client";

import { useState, useRef, useEffect } from "react";

type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  removing?: boolean;
};

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "todo-tasks";

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {}
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, mounted]);

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    setTasks((prev) => [
      { id: generateId(), text, completed: false, createdAt: Date.now() },
      ...prev,
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, removing: true } : t))
    );
    setTimeout(() => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  };

  const clearCompleted = () => {
    const completedIds = tasks.filter((t) => t.completed).map((t) => t.id);
    setTasks((prev) =>
      prev.map((t) =>
        completedIds.includes(t.id) ? { ...t, removing: true } : t
      )
    );
    setTimeout(() => {
      setTasks((prev) => prev.filter((t) => !completedIds.includes(t.id)));
    }, 250);
  };

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-4 py-16">
      <div className="mx-auto w-full max-w-lg">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-800">
            やること
          </h1>
          <p className="mt-1.5 text-sm text-gray-400">
            {activeCount > 0
              ? `あと ${activeCount} 件残っています`
              : tasks.length > 0
              ? "全て完了しました 🎉"
              : "タスクを追加してください"}
          </p>
        </div>

        {/* Input */}
        <div className="mb-6 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="新しいタスクを入力..."
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none placeholder:text-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
          />
          <button
            onClick={addTask}
            disabled={!input.trim()}
            className="rounded-xl bg-gray-800 px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            追加
          </button>
        </div>

        {/* Filter tabs */}
        {tasks.length > 0 && (
          <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1">
            {(["all", "active", "completed"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
                  filter === f
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {f === "all" ? "すべて" : f === "active" ? "未完了" : "完了済み"}
              </button>
            ))}
          </div>
        )}

        {/* Task list */}
        <div className="space-y-2">
          {filtered.length === 0 && tasks.length > 0 && (
            <p className="py-8 text-center text-sm text-gray-300">
              {filter === "active"
                ? "未完了のタスクはありません"
                : "完了済みのタスクはありません"}
            </p>
          )}

          {filtered.map((task) => (
            <div
              key={task.id}
              className={`group flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 shadow-sm transition-all ${
                task.removing
                  ? "translate-x-4 opacity-0 duration-200"
                  : "animate-slide-in opacity-100"
              } ${task.completed ? "border-gray-100" : "border-gray-100 hover:border-gray-200"}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTask(task.id)}
                className={`relative flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  task.completed
                    ? "border-gray-800 bg-gray-800"
                    : "border-gray-300 hover:border-gray-500"
                }`}
                aria-label={task.completed ? "未完了に戻す" : "完了にする"}
                data-tip={task.completed ? "未完了に戻す" : "完了にする"}
              >
                {task.completed && (
                  <svg
                    className="h-2.5 w-2.5 text-white"
                    fill="none"
                    viewBox="0 0 12 12"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2 6l3 3 5-5"
                    />
                  </svg>
                )}
              </button>

              {/* Text */}
              <span
                className={`flex-1 text-sm leading-relaxed transition-all ${
                  task.completed
                    ? "text-gray-300 line-through"
                    : "text-gray-700"
                }`}
              >
                {task.text}
              </span>

              {/* Delete button */}
              <button
                onClick={() => removeTask(task.id)}
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-gray-200 opacity-0 transition-all hover:bg-red-50 hover:text-red-400 group-hover:opacity-100"
                aria-label="削除"
                data-tip="削除"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 14 14"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2 2l10 10M12 2L2 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {completedCount > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={clearCompleted}
              className="text-xs text-gray-300 transition-colors hover:text-red-400"
            >
              完了済みを一括削除 ({completedCount}件)
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
