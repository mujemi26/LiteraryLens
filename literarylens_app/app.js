// app.js

// 1. Import necessary modules
const express = require('express');
const path = require('path');

// 2. Create an Express app
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Serve static files from the 'public' directory
// This line tells Express to automatically serve any files in the 'public' folder.
app.use(express.static(path.join(__dirname, 'public')));

// 4. SPA fallback: serve index.html for all non-file requests
app.use((req, res, next) => {
  if (
    req.method === 'GET' &&
    !req.path.split('/').pop().includes('.') // no file extension
  ) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

// 5. Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});