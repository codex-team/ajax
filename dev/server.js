const express = require('express');
const app = express();
const port = 3000;

const fs = require('fs');
const path = require('path');

/**
 * Return example page
 */
app.get('/', (req, res) => {
  const examplePage = fs.readFileSync(path.resolve(__dirname, 'example.html'), 'utf8');

  res.send(examplePage);
});

/**
 * Return script
 */
app.get('/ajax.js', (req, res) => {
  const jsCode = fs.readFileSync(path.resolve(__dirname, '..', 'dist', 'main.js'), 'utf8');

  res.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
  res.send(jsCode);
});

/**
 * Process POST request
 */
app.post('/', (req, res) => {
  const response = {
    success: 1,
    message: '✅ OK'
  };

  res.setHeader('Content-Type', 'application/json');
  res.send(response);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
