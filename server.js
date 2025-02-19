const express = require('express');
const Unblocker = require('unblocker');

const app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));

// Create a new instance of Unblocker
const unblocker = new Unblocker({
    prefix: '/proxy/', // The prefix for the proxy route
});

// Use the unblocker middleware
app.use(unblocker);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});