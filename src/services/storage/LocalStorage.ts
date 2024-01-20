export default class LocalStorage {
  get(key: string): string {
    const value = localStorage.getItem(key);

    if (value === null) {
      throw new Error(`Key ${key} not found`);
    }

    return value;
  }

  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}
