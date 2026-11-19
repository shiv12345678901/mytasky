import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, Check, Circle, Focus, ListTodo, Moon, Plus, Settings, Sun, Trash2 } from "lucide-react";
import { IosSheet } from "./components/IosSheet";
import type { Task, TaskList, Theme } from "./types";
import "./App.css";

const STORAGE_KEY = "mytasky-tasks-v1";
const THEME_KEY = "mytasky-theme";
const lists: TaskList[] = ["Personal", "Work", "Home"];
const todayLabel = new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
type Tab = "today" | "tasks" | "focus" | "settings";
type Filter = "all" | TaskList;

const initialTasks: Task[] = [
  { id: "plan-week", title: "Plan the week", list: "Personal", due: "Today", completed: false, priority: "high" },
  { id: "review-design", title: "Review app design", list: "Work", due: "Today", completed: false, priority: "normal" },
  { id: "book-groceries", title: "Order groceries", list: "Home", due: "Today", completed: true, priority: "normal" },
  { id: "send-notes", title: "Send meeting notes", list: "Work", due: "Tomorrow", completed: false, priority: "normal" },
];

function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) as Task[] : initialTasks;
  } catch {
    return initialTasks;
  }
}

function loadTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function TaskRow({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  return <li className={`task-row${task.completed ? " is-complete" : ""}`}>
    <button className="task-check" type="button" aria-label={`${task.completed ? "Mark incomplete" : "Complete"}: ${task.title}`} onClick={onToggle}>{task.completed ? <Check /> : <Circle />}</button>
    <div className="task-copy"><strong>{task.title}</strong><span>{task.list} · {task.due}</span></div>
    {task.priority === "high" && <span className="priority-dot" aria-label="High priority" />}
    <button className="task-delete" type="button" aria-label={`Delete ${task.title}`} onClick={onDelete}><Trash2 /></button>
  </li>;
}

export default function App() {
  const [tab, setTab] = useState<Tab>("today");
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [theme, setTheme] = useState<Theme>(loadTheme);
  const [filter, setFilter] = useState<Filter>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [list, setList] = useState<TaskList>("Personal");
  const [priority, setPriority] = useState<Task["priority"]>("normal");

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)), [tasks]);
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    const resolved = theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
    document.documentElement.dataset.theme = resolved;
  }, [theme]);

  const todayTasks = useMemo(() => tasks.filter((task) => task.due === "Today"), [tasks]);
  const visibleToday = filter === "all" ? todayTasks : todayTasks.filter((task) => task.list === filter);
  const completeCount = todayTasks.filter((task) => task.completed).length;
  const progress = todayTasks.length ? Math.round((completeCount / todayTasks.length) * 100) : 0;
  const nextTask = todayTasks.find((task) => !task.completed);

  function toggleTask(id: string) { setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task)); }
  function deleteTask(id: string) { setTasks((current) => current.filter((task) => task.id !== id)); }

  function addTask(event: FormEvent) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;
    setTasks((current) => [{ id: crypto.randomUUID(), title: nextTitle, list, due: "Today", completed: false, priority }, ...current]);
    setTitle("");
    setPriority("normal");
    setAddOpen(false);
  }

  return <div className="app-shell">
    <main>
      {tab === "today" && <section className="screen" aria-labelledby="today-title">
        <header className="page-header"><div><span className="eyebrow">{todayLabel}</span><h1 id="today-title">Good morning</h1></div><button className="add-button" type="button" aria-label="Add task" onClick={() => setAddOpen(true)}><Plus /></button></header>
        <section className="progress-card" aria-label={`${progress}% of today's tasks complete`}><div><span>Today</span><strong>{completeCount} of {todayTasks.length}</strong></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><p>{progress === 100 ? "Everything is done. Enjoy the space you made." : "A calm list, one clear next step."}</p></section>
        <div className="filter-pills" role="tablist" aria-label="Filter today's tasks">{(["all", ...lists] as Filter[]).map((item) => <button type="button" role="tab" aria-selected={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item === "all" ? "All" : item}</button>)}</div>
        <section className="content-section" aria-labelledby="today-tasks-title"><div className="section-heading"><h2 id="today-tasks-title">Today’s tasks</h2><span>{visibleToday.length}</span></div>{visibleToday.length ? <ul className="task-list">{visibleToday.map((task) => <TaskRow task={task} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} key={task.id} />)}</ul> : <div className="empty-state"><Check /><h3>You’re clear</h3><p>No tasks match this filter.</p></div>}</section>
      </section>}

      {tab === "tasks" && <section className="screen" aria-labelledby="tasks-title">
        <header className="page-header"><div><span className="eyebrow">Everything in one place</span><h1 id="tasks-title">Tasks</h1></div><button className="add-button" type="button" aria-label="Add task" onClick={() => setAddOpen(true)}><Plus /></button></header>
        {lists.map((taskList) => <section className="content-section" key={taskList}><div className="section-heading"><h2>{taskList}</h2><span>{tasks.filter((task) => task.list === taskList).length}</span></div><ul className="task-list">{tasks.filter((task) => task.list === taskList).map((task) => <TaskRow task={task} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} key={task.id} />)}</ul></section>)}
      </section>}

      {tab === "focus" && <section className="screen focus-screen" aria-labelledby="focus-title"><header className="page-header"><div><span className="eyebrow">One thing at a time</span><h1 id="focus-title">Focus</h1></div></header><section className="focus-card"><span className="focus-icon"><Focus /></span><span className="eyebrow">Up next</span><h2>{nextTask?.title ?? "Nothing left for today"}</h2><p>{nextTask ? `${nextTask.list} · ${nextTask.due}` : "Your Today list is complete."}</p><button type="button" disabled={!nextTask}>{nextTask ? "Start 25 minutes" : "All done"}</button></section></section>}

      {tab === "settings" && <section className="screen" aria-labelledby="settings-title">
        <header className="page-header"><div><span className="eyebrow">Make it yours</span><h1 id="settings-title">Settings</h1></div></header>
        <section className="content-section"><div className="section-heading"><h2>Appearance</h2></div><div className="settings-card"><span className="settings-icon">{theme === "dark" ? <Moon /> : <Sun />}</span><div><strong>Theme</strong><span>Choose how Mytasky looks</span></div><div className="theme-control" role="group" aria-label="Theme">{(["system", "light", "dark"] as Theme[]).map((option) => <button className={theme === option ? "active" : ""} type="button" aria-pressed={theme === option} onClick={() => setTheme(option)} key={option}>{option}</button>)}</div></div></section>
        <section className="content-section"><div className="section-heading"><h2>About</h2></div><div className="about-card"><strong>Mytasky</strong><span>iOS-style task starter · Version 0.1.0</span></div></section>
      </section>}
    </main>

    <nav className="tab-bar" aria-label="Primary navigation">{([["today", CalendarDays, "Today"], ["tasks", ListTodo, "Tasks"], ["focus", Focus, "Focus"], ["settings", Settings, "Settings"]] as const).map(([id, Icon, label]) => <button className={tab === id ? "active" : ""} type="button" aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)} key={id}><Icon /><span>{label}</span></button>)}</nav>

    <IosSheet open={addOpen} onClose={() => setAddOpen(false)} label="Add task"><form className="add-task-form" onSubmit={addTask}><header><button type="button" onClick={() => setAddOpen(false)}>Cancel</button><h2>New Task</h2><button className="save-task" type="submit" disabled={!title.trim()}>Add</button></header><label><span>Task</span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs doing?" maxLength={100} /></label><fieldset><legend>List</legend><div className="choice-row">{lists.map((item) => <button className={list === item ? "active" : ""} type="button" aria-pressed={list === item} onClick={() => setList(item)} key={item}>{item}</button>)}</div></fieldset><label className="priority-toggle"><span><strong>High priority</strong><small>Show a visual priority marker</small></span><input type="checkbox" checked={priority === "high"} onChange={(event) => setPriority(event.target.checked ? "high" : "normal")} /></label></form></IosSheet>
  </div>;
}
