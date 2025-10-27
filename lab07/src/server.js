const app = require('./app');

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  const basePath = '/api/v1';
  console.log(`Fellowship Registry API listening on port ${PORT} — base path ${basePath}`);
});
