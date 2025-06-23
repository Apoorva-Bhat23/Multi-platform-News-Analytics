const db     = require('../db');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');

/* POST /api/auth/login */
exports.login = (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (e, rows) => {
    if (e)            return res.status(500).json({ error: e });
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const ok   = await bcrypt.compare(password, user.password);
    if (!ok)            return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status !== 'active')
      return res.status(403).json({ message: 'Account inactive' });

    /* TODO:  replace 'secret' with env var in production */
    const token = jwt.sign({ id: user.id, role: user.role }, 'secret', { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });
};
