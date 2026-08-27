import express from "express";
import cors from "cors";
import "dotenv/config";

import autenticarToken from "./src/middlewares/autenticarToken.js";

import pacientesRoutes from "./src/routes/pacientes.js";
import medicosRoutes from "./src/routes/medicos.js";
import consultasRoutes from "./src/routes/consultas.js";
import authRoutes from "./src/routes/auth.js";


// ========================================
// CONFIGURAÇÃO DO EXPRESS
// ========================================

const app = express();

app.use(cors());
app.use(express.json());


// ========================================
// ROTA PRINCIPAL
// ========================================

app.get("/", (req, res) => {
  res.json({
    mensagem: "API da clínica funcionando!"
  });
});


// ========================================
// AUTENTICAÇÃO
// ========================================

// Rotas públicas:
// POST /usuarios
// POST /login

app.use(authRoutes);


// ========================================
// PACIENTES
// ========================================

app.use(
  "/pacientes",
  autenticarToken,
  pacientesRoutes
);


// ========================================
// MÉDICOS
// ========================================

app.use(
  "/medicos",
  autenticarToken,
  medicosRoutes
);


// ========================================
// CONSULTAS
// ========================================

app.use(
  "/consultas",
  autenticarToken,
  consultasRoutes
);


// ========================================
// ROTA 404
// ========================================

app.use((req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada",
  });
});


// ========================================
// SERVIDOR
// ========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});