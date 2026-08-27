import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const router = express.Router();


// ========================================
// CADASTRAR USUÁRIO
// ========================================

router.post("/usuarios", async (req, res) => {
  try {
    const {
      nome,
      email,
      senha
    } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: "Nome, email e senha são obrigatórios",
      });
    }

    const usuarioExistente =
      await prisma.usuario.findUnique({
        where: {
          email,
        },
      });

    if (usuarioExistente) {
      return res.status(409).json({
        erro: "Já existe um usuário com esse email",
      });
    }

    const senhaCriptografada =
      await bcrypt.hash(senha, 10);

    const usuario =
      await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: senhaCriptografada,
        },
      });

    res.status(201).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    });

  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao cadastrar usuário",
    });
  }
});


// ========================================
// LOGIN
// ========================================

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      senha
    } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: "Email e senha são obrigatórios",
      });
    }

    const usuario =
      await prisma.usuario.findUnique({
        where: {
          email,
        },
      });

    if (!usuario) {
      return res.status(401).json({
        erro: "Email ou senha inválidos",
      });
    }

    const senhaCorreta =
      await bcrypt.compare(
        senha,
        usuario.senha
      );

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "Email ou senha inválidos",
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "2h",
      }
    );

    res.json({
      mensagem: "Login realizado com sucesso",

      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },

      token,
    });

  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao realizar login",
    });
  }
});


export default router;