// routes/imagenes.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("./auth");
const { verificarToken, verificarAdmin } = auth;

// GET /imagenes/:producto_id - público
router.get("/:producto_id", async (req, res) => {
  const { producto_id } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM imagenes_productos WHERE producto_id = $1",
      [producto_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /imagenes - admin
router.post("/", verificarToken, verificarAdmin, async (req, res) => {
  const { url, producto_id, productoId } = req.body;
  const pid = producto_id ?? productoId; // acepta ambos nombres

  if (!url || !pid) {
    return res.status(400).json({ error: "url y producto_id son requeridos" });
  }

  try {
    const result = await db.query(
      "INSERT INTO imagenes_productos (url, producto_id) VALUES ($1, $2) RETURNING id, url, producto_id",
      [url, pid]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /imagenes/:id - admin
router.delete("/:id", verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM imagenes_productos WHERE id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Imagen no encontrada" });
    res.json({ mensaje: "Imagen eliminada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
