const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
app.get('/', (req, res) => res.send(`Hello from FSL Challenge | Secret: ${process.env.MY_SECRET || 'not-set'}`));
app.listen(port, () => console.log(`Running on ${port}`));

hello
