const ALLOWED_IMG_HOSTS = [
  "res.cloudinary.com",
  "localhost",
  "127.0.0.1"
];

export function isAllowedImageUrl(url) {
  try {
    const parsed = new URL(url, location.href);
    if (parsed.protocol === "http:" && (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")) {
      return true;
    }
    return parsed.protocol === "https:" && (ALLOWED_IMG_HOSTS.includes(parsed.hostname) || parsed.hostname === location.hostname);
  } catch {
    return false;
  }
}
