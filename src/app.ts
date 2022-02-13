// Drag & Drop Interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

// Project Type
enum ProjectStatus {
  Active = "active",
  Finished = "finished",
}

// Project Class
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

type Listener<T> = (items: T[]) => void;

abstract class State<T> {
  protected listeners: Listener<T>[] = [];
  protected items: T[] = [];

  addListener(listenerFunction: Listener<T>) {
    this.listeners.push(listenerFunction);
  }

  notifyListeners() {
    this.listeners.forEach((listenerFunction: Listener<T>) => {
      listenerFunction([...this.items]);
    });
  }
}

// Project State Management
class ProjectState extends State<Project> {
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance(): ProjectState {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }

  addProject(title: string, description: string, people: number) {
    const project = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active
    );

    this.items.push(project);
    this.notifyListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.items.find(
      (project: Project) => project.id === projectId
    );
    if (!project) return;
    if (project.status === newStatus) return;

    project.status = newStatus;
    this.notifyListeners();
  }
}

const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatable: Validatable) {
  let isValid = true;
  const value = validatable.value;

  if (validatable.required) {
    isValid = isValid && !!value.toString().trim().length;
  }

  if (typeof value === "string") {
    if (validatable.minLength != null) {
      isValid =
        isValid && value.toString().trim().length >= validatable.minLength;
    }

    if (validatable.maxLength != null) {
      isValid =
        isValid && value.toString().trim().length <= validatable.maxLength;
    }
  }

  if (typeof value === "number") {
    if (validatable.min != null) {
      isValid = isValid && value >= validatable.min;
    }

    if (validatable.max != null) {
      isValid = isValid && value <= validatable.max;
    }
  }

  return isValid;
}

// AutoBind Decorator
function AutoBind(
  target: any,
  methodName: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      return originalMethod.bind(this);
    },
  };

  return adjDescriptor;
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  protected templateElement: HTMLTemplateElement;
  protected hostElement: T;
  protected element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertPosition: InsertPosition,
    newElementId?: string
  ) {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById(templateId)
    );
    this.hostElement = <T>document.getElementById(hostElementId);

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = <U>importedNode.firstElementChild;
    if (newElementId) this.element.id = newElementId;

    this.attach(insertPosition);
  }

  private attach(insertPosition: InsertPosition) {
    this.hostElement.insertAdjacentElement(insertPosition, this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem
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

// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", "afterbegin", "user-input");

    this.titleInputElement = <HTMLInputElement>(
      this.element.querySelector("#title")
    );
    this.descriptionInputElement = <HTMLInputElement>(
      this.element.querySelector("#description")
    );
    this.peopleInputElement = <HTMLInputElement>(
      this.element.querySelector("#people")
    );

    this.configure();
    this.renderContent();
  }

  renderContent() {}

  private gatherUserInput(): [string, string, number] | undefined {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };

    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };

    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    const isInvalid =
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable);

    if (isInvalid) {
      alert("Invalid input, please try again");
      return;
    }

    return [enteredTitle, enteredDescription, +enteredPeople];
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  @AutoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();

    if (!Array.isArray(userInput)) {
      return;
    }

    const [title, description, people] = userInput;
    projectState.addProject(title, description, people);
    this.clearInputs();
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }
}

// ProjectList Class
class ProjectList
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

new ProjectInput();
new ProjectList(ProjectStatus.Active);
new ProjectList(ProjectStatus.Finished);
