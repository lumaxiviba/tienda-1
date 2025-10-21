require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rutas
app.use("/auth", require("./routes/auth").router);
app.use("/categorias", require("./routes/categorias"));
app.use("/imagenes", require("./routes/imagenes"));
app.use("/productos", require("./routes/productos"));

// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
