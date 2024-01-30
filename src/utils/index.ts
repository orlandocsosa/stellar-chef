function allowOnlyAlphanumeric(inputValue: string): string {
  return inputValue.replace(/[^a-zA-Z0-9]/g, '');
}

export { allowOnlyAlphanumeric };
