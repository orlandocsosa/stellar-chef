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

function sliceString(value: string): string {
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export { allowOnlyAlphanumeric, parseEntriesValues, sliceString };
