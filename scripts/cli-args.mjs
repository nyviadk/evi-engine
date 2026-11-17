// Værdien efter et kommandolinje-flag, fx arg("-s", "--slice"). Delt af check-scripts.
export function arg(...names) {
  const args = process.argv.slice(2);
  const i = args.findIndex((a) => names.includes(a));
  return i >= 0 ? args[i + 1] : undefined;
}
