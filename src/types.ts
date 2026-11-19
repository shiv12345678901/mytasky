export type TaskList = "Personal" | "Work" | "Home";
export type Theme = "system" | "light" | "dark";

export type Task = {
  id: string;
  title: string;
  list: TaskList;
  due: "Today" | "Tomorrow" | "Later";
  completed: boolean;
  priority: "normal" | "high";
};
