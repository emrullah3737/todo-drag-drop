import { ProjectStatus } from "../models/project.js";
import Project from "../models/project.js";
import State from "./state.js";

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

export default ProjectState.getInstance();
