import express from "express";
import cors from "cors";
import "dotenv/config";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const app = express();

app.use(cors());
app.use(express.json());


// ========================================
// MIDDLEWARE DE AUTENTICAÇÃO JWT
// ========================================

function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      erro: "Token não informado",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      erro: "Token inválido",
    });
  }

  try {
    const usuario = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = usuario;

    next();

  } catch (erro) {
    return res.status(401).json({
      erro: "Token inválido ou expirado",
    });
  }
}


// ========================================
// ROTA PRINCIPAL
// ========================================

app.get("/", (req, res) => {
  res.json({
    mensagem: "API da clínica funcionando!"
  });
});


// ========================================
// ROTAS PROTEGIDAS
// ========================================

// Tudo que começar com essas URLs precisa de JWT
app.use("/pacientes", autenticarToken);
app.use("/medicos", autenticarToken);
app.use("/consultas", autenticarToken);


// ========================================
// PACIENTES
// ========================================

// LISTAR PACIENTES + FILTRO + ORDENAÇÃO
app.get("/pacientes", async (req, res) => {
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
app.post("/pacientes", async (req, res) => {
  try {
    const {
      nome,
      cpf,
      telefone,
      email,
      dataNascimento
    } = req.body;

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


// BUSCAR PACIENTE PELO ID
app.get("/pacientes/:id", async (req, res) => {
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
app.put("/pacientes/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      nome,
      cpf,
      telefone,
      email,
      dataNascimento
    } = req.body;

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
app.delete("/pacientes/:id", async (req, res) => {
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


// ========================================
// MÉDICOS
// ========================================

// LISTAR MÉDICOS + FILTRO + ORDENAÇÃO
app.get("/medicos", async (req, res) => {
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
      nome: ordem === "desc"
        ? "desc"
        : "asc",
    },
  });

  res.json(medicos);
});


// CADASTRAR MÉDICO
app.post("/medicos", async (req, res) => {
  try {
    const {
      nome,
      crm,
      especialidade
    } = req.body;

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


// BUSCAR MÉDICO PELO ID
app.get("/medicos/:id", async (req, res) => {
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
app.put("/medicos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      nome,
      crm,
      especialidade
    } = req.body;

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
app.delete("/medicos/:id", async (req, res) => {
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


// ========================================
// CONSULTAS
// ========================================

// LISTAR CONSULTAS + FILTRO + ORDENAÇÃO
app.get("/consultas", async (req, res) => {
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
});


// CADASTRAR CONSULTA
app.post("/consultas", async (req, res) => {
  try {
    const {
      data,
      pacienteId,
      medicoId
    } = req.body;

    const consulta = await prisma.consulta.create({
      data: {
        data: new Date(data),
        pacienteId,
        medicoId,
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


// BUSCAR CONSULTA POR ID
app.get("/consultas/:id", async (req, res) => {
  const id = Number(req.params.id);

  const consulta = await prisma.consulta.findUnique({
    where: { id },

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
});


// ATUALIZAR CONSULTA
app.put("/consultas/:id", async (req, res) => {
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
      where: { id },

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


// EXCLUIR CONSULTA
app.delete("/consultas/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.consulta.delete({
      where: { id },
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


// ========================================
// USUÁRIOS
// ========================================

// ESSA ROTA CONTINUA PÚBLICA
app.post("/usuarios", async (req, res) => {
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
        where: { email },
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

// ESSA ROTA CONTINUA PÚBLICA
app.post("/login", async (req, res) => {
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
        where: { email },
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


// ========================================
// SERVIDOR
// ========================================

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});