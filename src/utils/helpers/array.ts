export const arrayMove = <T>(arr: T[], from: number, to: number) => {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
};
