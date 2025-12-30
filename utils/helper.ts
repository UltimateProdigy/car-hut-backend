export function cleanUpdateData<T>(data: Partial<T>): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
}
