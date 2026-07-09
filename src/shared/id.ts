let sequence = 1;

export function nextId(prefix: string): string {
  return `${prefix}_${sequence++}`;
}

export function resetIds(): void {
  sequence = 1;
}
