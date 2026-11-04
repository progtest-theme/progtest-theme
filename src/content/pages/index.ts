import type { ExtensionSettings } from "../../settings.ts";

import { Compilers } from "./Compilers/Compilers.ts";
import { Course } from "./Course/Course.ts";
import { Exam } from "./Exam.ts";
import { Logged } from "./Logged.ts";
import { LoginPage } from "./LoginPage.ts";
import { Main } from "./Main/Main.ts";
import { Results } from "./Results.ts";
import { Settings } from "./Settings/Settings.ts";
import { Task } from "./Task.ts";

export * from "./Compilers/Compilers.ts";
export * from "./Course/Course.ts";
export * from "./Exam.ts";
export * from "./Logged.ts";
export * from "./LoginPage.ts";
export * from "./Main/Main.ts";
export * from "./Settings/Settings.ts";
export * from "./Results.ts";
export * from "./Task.ts";
export * from "./Error/Error.ts";

export default new Map<new (settings: ExtensionSettings) => IPage, string[]>([
    [Compilers, ["CompilersDryRuns"]],
    [Course, ["Course"]],
    [Exam, ["KNTQ"]],
    [LoginPage, []],
    [Results, ["Results"]],
    [Task, ["Compiler", "DryRun", "Task", "TaskU"]],
    [Main, ["Main"]],
    [Settings, ["Preset"]],
    [Logged, ["FAQ", "Extra", "KNT", "TaskGrp"]]
]);
