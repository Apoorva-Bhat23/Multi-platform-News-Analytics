const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',       // your MySQL root username ie root only
  password: 'apoorva23',      // your password
  database: 'url_shortener',
});

db.connect((err) => {
  if (err) {
    console.error('DB connection error:', err);
  } else {
    console.log('Connected to MySQL DB!');
  }
});

module.exports = db;