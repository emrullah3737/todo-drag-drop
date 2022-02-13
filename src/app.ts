import ProjectInput from "./components/project-input.js";
import ProjectList from "./components/project-list.js";
import { ProjectStatus } from "./models/project.js";

const app = () => {
  new ProjectInput();
  new ProjectList(ProjectStatus.Active);
  new ProjectList(ProjectStatus.Finished);
};

app();
