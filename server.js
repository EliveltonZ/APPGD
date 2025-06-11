const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const routes = require("./routes");

const useCors = true;

app.use(express.static(path.join(__dirname, "public")));

if (useCors) {
  app.use(cors());
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "public", "error.html"));
});

const PORT = 5500;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
