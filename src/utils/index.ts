function allowOnlyAlphanumeric(inputValue: string): string {
  return inputValue.replace(/[^a-zA-Z0-9]/g, '');
}

function parseEntriesValues<T>(data: FormData | URLSearchParams): T {
  const newObj: Record<string, string> = {};

  for (const [key, value] of data.entries()) {
    if (typeof value === 'string') {
      newObj[key] = value;
    }
  }

  return newObj as T;
}

export { allowOnlyAlphanumeric, parseEntriesValues };
