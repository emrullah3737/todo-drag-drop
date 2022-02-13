export default abstract class Component<
  T extends HTMLElement,
  U extends HTMLElement
> {
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
