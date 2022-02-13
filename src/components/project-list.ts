import AutoBind from "../decorators/auto-bind.js";
import { DragTarget } from "../models/drag-drop.js";
import Project, { ProjectStatus } from "../models/project.js";
import projectState from "../utils/project-state.js";
import Component from "./base-component.js";
import ProjectItem from "./project-item.js";

export default class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[] = [];

  constructor(private type: ProjectStatus) {
    super("project-list", "app", "beforeend", `${type}-projects`);

    this.configure();
    this.renderContent();
  }

  configure(): void {
    projectState.addListener(this.handleProjectStateListener);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("drop", this.dropHandler);
  }

  @AutoBind
  private handleProjectStateListener(projects: Project[]): void {
    this.assignedProjects = projects.filter(
      (project: Project) => project.status === this.type
    );
    this.renderProjects();
  }

  private renderProjects() {
    const listEl = <HTMLUListElement>(
      document.getElementById(`${this.type}-projects-list`)!
    );
    // when the listener triggered, we must clean the old list and render the new list
    listEl.innerHTML = "";

    this.assignedProjects.forEach((project: Project) => {
      new ProjectItem(this.element.querySelector("ul")!.id, project);
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent = `${this.type
      .toString()
      .toUpperCase()} PROJECTS`;
  }

  @AutoBind
  dragOverHandler(event: DragEvent): void {
    if (!event.dataTransfer) return;

    const {
      types: [format, data],
    } = event.dataTransfer;

    if (format !== "text/plain") return;

    event.preventDefault();
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.add("droppable");
  }

  @AutoBind
  dragLeaveHandler(event: DragEvent): void {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  @AutoBind
  dropHandler(event: DragEvent): void {
    if (!event.dataTransfer) return;

    const projectId = event.dataTransfer.getData("text/plain");
    projectState.moveProject(projectId, this.type);
  }
}
