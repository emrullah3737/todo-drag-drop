import AutoBind from "../decorators/auto-bind";
import { Draggable } from "../models/drag-drop";
import Project from "../models/project";
import Component from "./base-component";

export default class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  private get peopleText() {
    if (this.project.people > 1) {
      return `${this.project.people} People assigned`;
    }

    return `${this.project.people} Person assigned`;
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, "beforeend", project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  configure(): void {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent(): void {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.peopleText;
    this.element.querySelector("p")!.textContent = this.project.description;
  }

  @AutoBind
  dragStartHandler(event: DragEvent): void {
    if (!event.dataTransfer) return;

    event.dataTransfer.setData("text/plain", this.project.id);
    event.dataTransfer.effectAllowed = "move";
  }

  @AutoBind
  dragEndHandler(event: DragEvent): void {}
}
