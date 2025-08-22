import controller from "@/infra/controller";
import authentication from "@/models/authentication";
import session from "@/models/session";
import { UnauthorizedError } from "@/infra/errors";
import type { NextApiRequest, NextApiResponse } from "next";

interface UserInput {
  username?: string;
  email: string;
  password: string;
  [key: string]: any;
}

interface Session {
  id: string;
  token: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  [key: string]: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  switch (req.method) {
    case "POST":
      return postHandler(req, res);
    case "DELETE":
      return deleteHandler(req, res);
    default:
      res.setHeader("Allow", ["POST", "DELETE"]);
      return res.status(405).json({ message: "Method not allowed" });
  }
}

async function postHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    const userInputValues: UserInput = req.body;

    const authenticatedUser = await authentication.getAuthenticatedUser(
      userInputValues.email,
      userInputValues.password,
    );

    const newSession: Session = await session.create(authenticatedUser.id);

    controller.setSessionCookie(newSession.token, res);

    res.status(201).json(newSession);
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({
        name: error.name,
        message: error.message,
        action: error.action,
      });
    }

    console.error("Erro inesperado no postHandler:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

async function deleteHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    const sessionToken = req.cookies.session_id;

    if (!sessionToken) {
      return res
        .status(401)
        .json({ message: "Sessão inválida ou não encontrada" });
    }

    const sessionObject: Session =
      await session.findOneValidByToken(sessionToken);

    const expiredSession: Session = await session.expireById(sessionObject.id);

    controller.clearSessionCookie(res);

    res.status(200).json(expiredSession);
  } catch (error) {
    console.error("Erro no deleteHandler:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}
