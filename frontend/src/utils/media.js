const BASE = import.meta.env.DEV ? "http://localhost:5000" : "";

export const mediaUrl = (path) => (path ? `${BASE}${path}` : null);
