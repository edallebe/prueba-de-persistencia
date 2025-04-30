const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const usersRoutes = require('../../backend/routes/usersroutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/.netlify/functions/getUser', usersRoutes);

// Not found route
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Export the serverless function
module.exports.handler = serverless(app);