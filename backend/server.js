const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const { redirect } = require('./controllers/urlController');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.get('/:short', redirect);

app.listen(port, () => console.log(`🔗 API ready at http://localhost:${port}`));
