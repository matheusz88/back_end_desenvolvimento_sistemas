import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();


// ========================================
// LISTAR CONSULTAS + FILTRO + ORDENAÇÃO
// ========================================

router.get("/", async (req, res) => {
  try {
    const { status, ordem } = req.query;

    const consultas = await prisma.consulta.findMany({
      where: {
        status: status || undefined,
      },

      orderBy: {
        data: ordem === "desc"
          ? "desc"
          : "asc",
      },

      include: {
        paciente: true,
        medico: true,
      },
    });

    res.json(consultas);

  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao listar consultas",
    });
  }
});


// ========================================
// CADASTRAR CONSULTA
// ========================================

router.post("/", async (req, res) => {
  try {
    const {
      data,
      pacienteId,
      medicoId
    } = req.body;

    if (!data || !pacienteId || !medicoId) {
      return res.status(400).json({
        erro: "Data, paciente e médico são obrigatórios",
      });
    }

    const consulta = await prisma.consulta.create({
      data: {
        data: new Date(data),
        pacienteId: Number(pacienteId),
        medicoId: Number(medicoId),
      },

      include: {
        paciente: true,
        medico: true,
      },
    });

    res.status(201).json(consulta);

  } catch (erro) {
    res.status(400).json({
      erro: "Não foi possível agendar a consulta",
    });
  }
});


// ========================================
// BUSCAR CONSULTA POR ID
// ========================================

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const consulta = await prisma.consulta.findUnique({
      where: {
        id,
      },

      include: {
        paciente: true,
        medico: true,
      },
    });

    if (!consulta) {
      return res.status(404).json({
        erro: "Consulta não encontrada",
      });
    }

    res.json(consulta);

  } catch (erro) {
    res.status(400).json({
      erro: "ID da consulta inválido",
    });
  }
});


// ========================================
// ATUALIZAR CONSULTA
// ========================================

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      data,
      status,
      pacienteId,
      medicoId
    } = req.body;

    const dados = {};

    if (data) {
      dados.data = new Date(data);
    }

    if (status) {
      dados.status = status;
    }

    if (pacienteId !== undefined) {
      dados.pacienteId = Number(pacienteId);
    }

    if (medicoId !== undefined) {
      dados.medicoId = Number(medicoId);
    }

    const consulta = await prisma.consulta.update({
      where: {
        id,
      },

      data: dados,

      include: {
        paciente: true,
        medico: true,
      },
    });

    res.json(consulta);

  } catch (erro) {
    res.status(404).json({
      erro: "Consulta não encontrada",
    });
  }
});


// ========================================
// EXCLUIR CONSULTA
// ========================================

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.consulta.delete({
      where: {
        id,
      },
    });

    res.json({
      mensagem: "Consulta excluída com sucesso",
    });

  } catch (erro) {
    res.status(404).json({
      erro: "Consulta não encontrada",
    });
  }
});


export default router;