import "dotenv/config";
import jwt from "jsonwebtoken";

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

export default autenticarToken;