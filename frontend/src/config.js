const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export default API_URL;

export function resolveProfilePhotoUrl(val) {
  if (!val) return null;
  try {
    if (val.startsWith('data:') || val.startsWith('http://') || val.startsWith('https://')) return val;
    if (val.startsWith('/')) return `${API_URL}${val}`;
    return val;
  } catch (e) {
    return val;
  }
}

