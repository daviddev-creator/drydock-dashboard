const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ name: "Drydock Dashboard API", status: 'ok' });
});

app.use('/api', apiRoutes);

app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint Tidak Ada!' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Terjadi Kesalahan di Server' });
});

module.exports = app;