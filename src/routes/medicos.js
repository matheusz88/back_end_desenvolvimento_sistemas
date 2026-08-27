import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// LISTAR MÉDICOS + FILTRO + ORDENAÇÃO
router.get("/", async (req, res) => {
  const { especialidade, ordem } = req.query;

  const medicos = await prisma.medico.findMany({
    where: {
      especialidade: especialidade
        ? {
            contains: especialidade,
          }
        : undefined,
    },

    orderBy: {
      nome: ordem === "desc" ? "desc" : "asc",
    },
  });

  res.json(medicos);
});

// CADASTRAR MÉDICO
router.post("/", async (req, res) => {
  try {
    const { nome, crm, especialidade } = req.body;

    const medico = await prisma.medico.create({
      data: {
        nome,
        crm,
        especialidade,
      },
    });

    res.status(201).json(medico);
  } catch (erro) {
    res.status(400).json({
      erro: "Não foi possível cadastrar o médico",
    });
  }
});

// BUSCAR MÉDICO POR ID
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const medico = await prisma.medico.findUnique({
    where: { id },
  });

  if (!medico) {
    return res.status(404).json({
      erro: "Médico não encontrado",
    });
  }

  res.json(medico);
});

// ATUALIZAR MÉDICO
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome, crm, especialidade } = req.body;

    const medico = await prisma.medico.update({
      where: { id },
      data: {
        nome,
        crm,
        especialidade,
      },
    });

    res.json(medico);
  } catch (erro) {
    res.status(404).json({
      erro: "Médico não encontrado",
    });
  }
});

// EXCLUIR MÉDICO
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.medico.delete({
      where: { id },
    });

    res.json({
      mensagem: "Médico excluído com sucesso",
    });
  } catch (erro) {
    res.status(404).json({
      erro: "Médico não encontrado",
    });
  }
});

export default router;