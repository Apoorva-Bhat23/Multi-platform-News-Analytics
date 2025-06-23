// controllers/urlController.js

const db = require('../db');
const generatePlatformSlugs = require('../utils/generateShortUrl');

let shortUrlLength = 6;

exports.setLen = (req, res) => {
  const { length } = req.body;
  if (![6, 7].includes(length)) return res.status(400).json({ message: 'Length must be 6 or 7' });
  shortUrlLength = length;
  res.json({ message: `Short URL length set to ${length}` });
};

exports.shorten = (req, res) => {
  const { user_id, long_url, news_title } = req.body;
  const slugs = generatePlatformSlugs(news_title, shortUrlLength);

  const urlInsertQuery = `INSERT INTO urls (user_id, news_title, long_url) VALUES (?, ?, ?)`;

  db.query(urlInsertQuery, [user_id, news_title, long_url], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB Error', error: err });

    const urlId = result.insertId;
    const shortUrlInserts = Object.entries(slugs).map(([platform, slug]) => [urlId, platform, slug]);

    db.query(
      `INSERT INTO shorturls (url_id, platform, short_url) VALUES ?`,
      [shortUrlInserts],
      (err2) => {
        if (err2) return res.status(500).json({ message: 'Insert Error', error: err2 });
        res.json({ message: 'Short URLs created successfully', slugs });
      }
    );
  });
};

exports.list = (req, res) => {
  const sql = `
    SELECT s.short_url, s.platform, u.long_url, u.news_title, u.created_at, us.username,
           (SELECT COUNT(*) FROM clicks c WHERE c.shorturl_id = s.id) AS clicks
    FROM shorturls s
    JOIN urls u ON s.url_id = u.id
    JOIN users us ON u.user_id = us.id
    ORDER BY u.created_at DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error loading URLs', error: err });
    res.json(rows);
  });
};

exports.stats = (req, res) => {
  db.query(`SELECT COUNT(DISTINCT url_id) AS total_urls FROM shorturls`, (err, urlCount) => {
    if (err) return res.status(500).json({ error: err });

    db.query(`SELECT COUNT(*) AS total_clicks FROM clicks`, (err2, clickCount) => {
      if (err2) return res.status(500).json({ error: err2 });

      res.json({
        total_urls: urlCount[0].total_urls || 0,
        total_clicks: clickCount[0].total_clicks || 0
      });
    });
  });
};

exports.platformClicks = (req, res) => {
  const baseSlug = req.params.base;
  const sql = `
    SELECT platform, COUNT(c.id) AS clicks
    FROM shorturls s
    LEFT JOIN clicks c ON c.shorturl_id = s.id
    WHERE s.short_url LIKE CONCAT(?, '_%')
    GROUP BY platform
  `;

  db.query(sql, [baseSlug], (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    const result = {};
    for (const row of rows) result[row.platform] = row.clicks;
    res.json(result);
  });
};

exports.redirect = (req, res) => {
  const slug = req.params.short;

  db.query(
    `SELECT s.id, u.long_url FROM shorturls s JOIN urls u ON s.url_id = u.id WHERE s.short_url = ?`,
    [slug],
    (err, rows) => {
      if (err || !rows.length) return res.redirect('/login');

      const clickInsert = {
        shorturl_id: rows[0].id,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      };
      db.query(`INSERT INTO clicks SET ?`, clickInsert);
      res.redirect(rows[0].long_url);
    }
  );
};
