import "./assets/app.css";
import ProjectInput from "./components/project-input";
import ProjectList from "./components/project-list";
import { ProjectStatus } from "./models/project";

const app = () => {
  new ProjectInput();
  new ProjectList(ProjectStatus.Active);
  new ProjectList(ProjectStatus.Finished);
};

app();
