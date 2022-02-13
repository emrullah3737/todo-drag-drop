// Project Type
export enum ProjectStatus {
  Active = "active",
  Finished = "finished",
}

// Project Class
export default class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}
