const ALLOWED_IMG_HOSTS = [
  "res.cloudinary.com",
];

export function isAllowedImageUrl(url) {
  try {
    const parsed = new URL(url, location.href);
    return parsed.protocol === "https:" && ALLOWED_IMG_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}
