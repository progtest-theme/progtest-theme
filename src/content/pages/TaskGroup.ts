import { Logged } from "./Logged";
import { Task } from "./Task";

export class TaskGroup extends Logged {
    className = "task-group";

    override highlightCode() {
        Task.preserveSampleFormatting();
        super.highlightCode();
    }

    async initialise() {
        await super.initialise();
        document
            .querySelectorAll(".topLayout > :is(.newBox, .outBox) > table, body > center > .newBox > table")
            .forEach((table) => table.classList.add("task-report"));
    }
}
