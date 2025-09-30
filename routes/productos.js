// routes/productos.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const { verificarToken, verificarAdmin } = require("./auth");

// GET /productos - público (lista de productos)
router.get("/", async (_req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT p.id, p.nombre, p.precio, c.nombre AS categoria, p.categoria_id
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /productos/:id - público (detalle con imágenes)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Traer producto
    const { rows: productos } = await db.query(`
      SELECT p.id, p.nombre, p.precio, c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = $1
    `, [id]);

    if (productos.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const producto = productos[0];

    // Traer imágenes asociadas
    const { rows: imagenes } = await db.query(`
      SELECT url
      FROM imagenes_productos
      WHERE producto_id = $1
      ORDER BY id
    `, [id]);

    producto.imagenes = imagenes.map(img => img.url);

    res.json(producto);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /productos - admin
router.post("/", verificarToken, verificarAdmin, async (req, res) => {
  let { nombre, precio, categoria_id, categoriaId } = req.body;
  categoria_id = categoria_id ?? categoriaId;

  if (!nombre || precio == null || !categoria_id) {
    return res.status(400).json({ error: "nombre, precio y categoria_id son requeridos" });
  }

  try {
    const { rows } = await db.query(
      "INSERT INTO productos (nombre, precio, categoria_id) VALUES ($1, $2, $3) RETURNING id",
      [nombre, precio, categoria_id]
    );
    res.json({ id: rows[0].id, nombre, precio, categoria_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /productos/:id - admin
router.put("/:id", verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;
  let { nombre, precio, categoria_id, categoriaId } = req.body;
  categoria_id = categoria_id ?? categoriaId;

  const sets = [];
  const vals = [];
  if (nombre !== undefined) { sets.push(`nombre = $${sets.length + 1}`); vals.push(nombre); }
  if (precio !== undefined) { sets.push(`precio = $${sets.length + 1}`); vals.push(precio); }
  if (categoria_id !== undefined) { sets.push(`categoria_id = $${sets.length + 1}`); vals.push(categoria_id); }

  if (sets.length === 0) return res.status(400).json({ error: "Nada para actualizar" });

  vals.push(id);

  try {
    await db.query(`UPDATE productos SET ${sets.join(", ")} WHERE id = $${sets.length + 1}`, vals);
    res.json({ id: Number(id), nombre, precio, categoria_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /productos/:id - admin
router.delete("/:id", verificarToken, verificarAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM productos WHERE id = $1", [id]);
    res.json({ mensaje: "Producto eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
