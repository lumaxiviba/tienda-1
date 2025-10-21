const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_cambialo";

const getTokenFromHeader = (req) => {
  const auth = req.headers.authorization || "";
  const [type, token] = auth.split(" ");
  return type === "Bearer" ? token : null;
};

//Middleware
function verificarToken(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ error: "No hay Token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, usuario, rol }
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

//Middleware verifica
function verificarAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "No autenticado" });
  if (req.user.rol !== "admin") return res.status(403).json({ error: "Acceso denegado" });
  next();
}

// Rutas de autenticación
router.post('/login', async (req, res) => {
  // Implementar lógica de login
  res.json({ message: "Login endpoint" });
});

router.post('/register', async (req, res) => {
  // Implementar lógica de registro
  res.json({ message: "Register endpoint" });
});

module.exports = router;
exports.verificarToken = verificarToken;
exports.verificarAdmin = verificarAdmin;
