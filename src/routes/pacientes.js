import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// LISTAR PACIENTES + FILTRO + ORDENAÇÃO
router.get("/", async (req, res) => {
  const { nome, ordem } = req.query;

  const pacientes = await prisma.paciente.findMany({
    where: {
      nome: nome
        ? {
            contains: nome,
          }
        : undefined,
    },

    orderBy: {
      nome: ordem === "desc" ? "desc" : "asc",
    },
  });

  res.json(pacientes);
});

// CADASTRAR PACIENTE
router.post("/", async (req, res) => {
  try {
    const { nome, cpf, telefone, email, dataNascimento } = req.body;

    const paciente = await prisma.paciente.create({
      data: {
        nome,
        cpf,
        telefone,
        email,
        dataNascimento: dataNascimento
          ? new Date(dataNascimento)
          : null,
      },
    });

    res.status(201).json(paciente);
  } catch (erro) {
    res.status(400).json({
      erro: "Não foi possível cadastrar o paciente",
    });
  }
});

// BUSCAR PACIENTE POR ID
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const paciente = await prisma.paciente.findUnique({
    where: { id },
  });

  if (!paciente) {
    return res.status(404).json({
      erro: "Paciente não encontrado",
    });
  }

  res.json(paciente);
});

// ATUALIZAR PACIENTE
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const { nome, cpf, telefone, email, dataNascimento } = req.body;

    const paciente = await prisma.paciente.update({
      where: { id },
      data: {
        nome,
        cpf,
        telefone,
        email,
        dataNascimento: dataNascimento
          ? new Date(dataNascimento)
          : null,
      },
    });

    res.json(paciente);
  } catch (erro) {
    res.status(404).json({
      erro: "Paciente não encontrado",
    });
  }
});

// EXCLUIR PACIENTE
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.paciente.delete({
      where: { id },
    });

    res.json({
      mensagem: "Paciente excluído com sucesso",
    });
  } catch (erro) {
    res.status(404).json({
      erro: "Paciente não encontrado",
    });
  }
});

export default router;