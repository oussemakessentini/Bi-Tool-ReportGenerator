import router from '../src/PDF/PdfRoute.js';
import cors from 'cors';
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use('/pdf', cors(), router );

app.listen(5004, () => {
  console.log('Server started on port 5004');
});


