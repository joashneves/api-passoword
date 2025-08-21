import type { NextApiRequest, NextApiResponse } from "next";
import user from "@/models/user";
import { NotFoundError } from "@/infra/errors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    return getHandler(req, res);
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const usernameQuery = req.query.username;

    if (!usernameQuery || Array.isArray(usernameQuery)) {
      return res.status(400).json({ message: "Username inválido" });
    }

    const userFound = await user.findOneByUsername(usernameQuery);
    return res.status(200).json(userFound);
  } catch (err: any) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ message: err.message, action: err.action });
    }
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
