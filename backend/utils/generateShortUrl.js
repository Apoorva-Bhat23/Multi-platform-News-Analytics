// utils/generateShortUrl.js

function generatePlatformSlugs(newsTitle = '', length = 6) {
  if (typeof newsTitle !== 'string') newsTitle = String(newsTitle);
  const base = newsTitle.trim().toLowerCase().replace(/[^a-z0-9]/gi, '').slice(0, Math.max(2, length - 3));
  const suffix = () => Math.random().toString().slice(2, 2 + (length - base.length));
  const used = new Set();
  const platforms = ['facebook', 'twitter', 'telegram', 'whatsapp'];
  const slugs = {};

  for (let platform of platforms) {
    let slug;
    do {
      slug = `${base}${suffix()}`;
    } while (used.has(slug));
    used.add(slug);
    slugs[platform] = slug;
  }

  return slugs;
}

module.exports = generatePlatformSlugs;
