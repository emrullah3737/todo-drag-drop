type Listener<T> = (items: T[]) => void;

export default abstract class State<T> {
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
