const express = require('express');
const app = express();
const port = 3000;
const annotationHandler = require('./annotationHandler');
const bodyParser = require('body-parser');

app.use(bodyParser.text());
app.use(express.static('client'));

app.listen(port, '0.0.0.0', () => {
  console.info(`Server listening at port ${port}`);
});

annotationHandler(app);