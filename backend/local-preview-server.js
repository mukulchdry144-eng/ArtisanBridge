const app = require("./src/app");
const { initStorage } = require("./src/storage/repo");

process.env.MONGO_URI = "";

const port = Number(process.env.PORT || 5000);

initStorage()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
