export function strongPasswordError(password) {
  const p = String(password || "");
  if (p.length < 8) return "Use at least 8 characters";
  if (!/[A-Z]/.test(p)) return "Include an uppercase letter";
  if (!/[a-z]/.test(p)) return "Include a lowercase letter";
  if (!/[0-9]/.test(p)) return "Include a number";
  return null;
}
