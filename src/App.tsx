import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { GlassButton, GlassCard, GlassInput, GlassSegmented, GlassSheet, GlassSwitch } from "@zakisheriff/liquid-glass";
import { CalendarDays, Check, Circle, CloudOff, Download, ListTodo, Moon, Plus, RefreshCw, Settings, Sparkles, Sun, Trash2, Wifi } from "lucide-react";
import type { Task, TaskList, Theme } from "./types";
import "./App.css";

const STORAGE_KEY = "mytasky-tasks-v1";
const THEME_KEY = "mytasky-theme";
const lists: TaskList[] = ["Personal", "Work", "Home"];
const tabs = ["today", "tasks", "settings"] as const;
const todayLabel = new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
type Tab = (typeof tabs)[number];
type Filter = "all" | TaskList;

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const initialTasks: Task[] = [
  { id: "plan-week", title: "Plan the week", list: "Personal", due: "Today", completed: false, priority: "high" },
  { id: "review-design", title: "Review app design", list: "Work", due: "Today", completed: false, priority: "normal" },
  { id: "book-groceries", title: "Order groceries", list: "Home", due: "Today", completed: true, priority: "normal" },
  { id: "send-notes", title: "Send meeting notes", list: "Work", due: "Tomorrow", completed: false, priority: "normal" },
];

function loadTasks(): Task[] {
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
    {task.priority === "high" && <span className="priority-label"><span />High</span>}
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
  const [online, setOnline] = useState(() => navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const scrollPositions = useRef<Record<Tab, number>>({ today: 0, tasks: 0, settings: 0 });

  const todayTasks = useMemo(() => tasks.filter((task) => task.due === "Today"), [tasks]);
  const visibleToday = filter === "all" ? todayTasks : todayTasks.filter((task) => task.list === filter);
  const completeCount = todayTasks.filter((task) => task.completed).length;
  const progress = todayTasks.length ? Math.round((completeCount / todayTasks.length) * 100) : 0;

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)), [tasks]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => { document.documentElement.dataset.theme = theme === "system" ? (query.matches ? "dark" : "light") : theme; };
    applyTheme();
    query.addEventListener("change", applyTheme);
    return () => query.removeEventListener("change", applyTheme);
  }, [theme]);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onInstallPrompt = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    const onInstalled = () => { setInstalled(true); setInstallPrompt(null); };
    const onOfflineReady = () => setOfflineReady(true);
    const onUpdateReady = () => setUpdateReady(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("mytasky:offline-ready", onOfflineReady);
    window.addEventListener("mytasky:update-ready", onUpdateReady);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("mytasky:offline-ready", onOfflineReady);
      window.removeEventListener("mytasky:update-ready", onUpdateReady);
    };
  }, []);

  useLayoutEffect(() => { window.scrollTo({ top: scrollPositions.current[tab], behavior: "instant" }); }, [tab]);

  function changeTab(nextTab: Tab) {
    if (nextTab === tab) return;
    scrollPositions.current[tab] = window.scrollY;
    setTab(nextTab);
  }

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

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  }

  return <div className="app-shell">
    <div className="ambient ambient-one" aria-hidden="true" />
    <div className="ambient ambient-two" aria-hidden="true" />
    <main>
      <section className="screen" hidden={tab !== "today"} aria-labelledby="today-title">
        <header className="page-header"><div><span className="eyebrow">{todayLabel}</span><h1 id="today-title">Good morning</h1></div><GlassButton className="add-button" variant="filled" tint="#0a84ff" size="lg" icon={<Plus />} aria-label="Add task" onClick={() => setAddOpen(true)} /></header>
        <GlassCard className="progress-card" intensity={4} thickness={2} tint="rgba(10,132,255,.08)" padding="20px" radius="26px"><div><span>Today</span><strong>{completeCount} of {todayTasks.length}</strong></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><p>{progress === 100 ? "Everything is done. Enjoy the space you made." : "A calm list, one clear next step."}</p></GlassCard>
        <div className="filter-control" role="tablist" aria-label="Filter today's tasks">{(["all", ...lists] as Filter[]).map((item) => <button type="button" role="tab" aria-selected={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item === "all" ? "All" : item}</button>)}</div>
        <section className="content-section" aria-labelledby="today-tasks-title"><div className="section-heading"><h2 id="today-tasks-title">Today’s tasks</h2><span>{visibleToday.length}</span></div>{visibleToday.length ? <ul className="task-list">{visibleToday.map((task) => <TaskRow task={task} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} key={task.id} />)}</ul> : <div className="empty-state"><Check /><h3>You’re clear</h3><p>No tasks match this filter.</p></div>}</section>
      </section>

      <section className="screen" hidden={tab !== "tasks"} aria-labelledby="tasks-title">
        <header className="page-header"><div><span className="eyebrow">Everything in one place</span><h1 id="tasks-title">Tasks</h1></div><GlassButton className="add-button" variant="filled" tint="#0a84ff" size="lg" icon={<Plus />} aria-label="Add task" onClick={() => setAddOpen(true)} /></header>
        {lists.map((taskList) => <section className="content-section" key={taskList}><div className="section-heading"><h2>{taskList}</h2><span>{tasks.filter((task) => task.list === taskList).length}</span></div>{tasks.some((task) => task.list === taskList) ? <ul className="task-list">{tasks.filter((task) => task.list === taskList).map((task) => <TaskRow task={task} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} key={task.id} />)}</ul> : <div className="compact-empty">No tasks yet</div>}</section>)}
      </section>

      <section className="screen" hidden={tab !== "settings"} aria-labelledby="settings-title">
        <header className="page-header"><div><span className="eyebrow">Make it yours</span><h1 id="settings-title">Settings</h1></div></header>
        <section className="content-section"><div className="section-heading"><h2>Appearance</h2></div><div className="settings-card"><span className="settings-icon purple">{theme === "dark" ? <Moon /> : <Sun />}</span><div><strong>Theme</strong><span>Follow the system or choose a look</span></div><div className="theme-control" role="group" aria-label="Theme">{(["system", "light", "dark"] as Theme[]).map((option) => <button className={theme === option ? "active" : ""} type="button" aria-pressed={theme === option} onClick={() => setTheme(option)} key={option}>{option}</button>)}</div></div></section>
        <section className="content-section"><div className="section-heading"><h2>App</h2></div><div className="settings-card app-status-card"><span className={`settings-icon ${online ? "blue" : "orange"}`}>{online ? <Wifi /> : <CloudOff />}</span><div><strong>{installed ? "Installed app" : "Offline ready"}</strong><span>{online ? "Tasks stay available without a connection" : "You’re offline — changes are saved on this device"}</span></div>{installPrompt && !installed && <GlassButton className="install-button" variant="tinted-filled" tint="#0a84ff" icon={<Download />} onClick={() => void installApp()}>Install</GlassButton>}</div></section>
        <section className="content-section"><div className="section-heading"><h2>About</h2></div><div className="about-card"><span className="about-icon"><Sparkles /></span><div><strong>Mytasky</strong><span>Private, local-first and offline · Version 0.2.1</span></div></div></section>
      </section>
    </main>

    {(offlineReady || !online) && <div className="app-notice" role="status"><GlassCard intensity={3} radius="20px" padding="12px 14px"><span>{online ? <Check /> : <CloudOff />}</span><p>{online ? "Mytasky is ready offline" : "Working offline"}</p><button type="button" aria-label="Dismiss" onClick={() => setOfflineReady(false)}>×</button></GlassCard></div>}

    <nav className="tab-bar" aria-label="Primary navigation">{([{ id: "today", label: "Today", Icon: CalendarDays }, { id: "tasks", label: "Tasks", Icon: ListTodo }, { id: "settings", label: "Settings", Icon: Settings }] as const).map(({ id, label, Icon }) => <button type="button" className={tab === id ? "active" : ""} aria-current={tab === id ? "page" : undefined} onClick={() => changeTab(id)} key={id}><Icon /><span>{label}</span></button>)}</nav>

    <GlassSheet open={addOpen} onClose={() => setAddOpen(false)} intensity={5} aria-label="Add task"><form className="add-task-form" onSubmit={addTask}><header><GlassButton variant="clear" type="button" onClick={() => setAddOpen(false)}>Cancel</GlassButton><h2>New Task</h2><GlassButton className="save-task" variant="tinted" type="submit" disabled={!title.trim()}>Add</GlassButton></header><GlassInput autoFocus label="Task" value={title} onChange={(event) => setTitle(event.target.value)} onClear={() => setTitle("")} placeholder="What needs doing?" maxLength={100} /><fieldset><legend>List</legend><GlassSegmented options={lists} value={lists.indexOf(list)} onChange={(index) => setList(lists[index] ?? "Personal")} aria-label="Task list" /></fieldset><div className="priority-toggle"><span><strong>High priority</strong><small>Make this task stand out</small></span><GlassSwitch checked={priority === "high"} onChange={(checked) => setPriority(checked ? "high" : "normal")} tint="#ff9f0a" aria-label="High priority" /></div></form></GlassSheet>

    <GlassSheet open={updateReady && !addOpen} onClose={() => setUpdateReady(false)} intensity={5} aria-label="App update available"><section className="update-sheet"><span className="update-icon"><RefreshCw /></span><h2>Update Mytasky?</h2><p>A fresh version is ready. Your tasks are stored safely on this device.</p><div><GlassButton variant="clear" onClick={() => setUpdateReady(false)}>Later</GlassButton><GlassButton variant="filled" tint="#0a84ff" onClick={() => window.dispatchEvent(new Event("mytasky:apply-update"))}>Update now</GlassButton></div></section></GlassSheet>
  </div>;
}
