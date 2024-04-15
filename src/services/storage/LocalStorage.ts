export default class LocalStorage {
  get(key: string): string | null {
    const value = localStorage.getItem(key);

    return value;
  }

  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}
