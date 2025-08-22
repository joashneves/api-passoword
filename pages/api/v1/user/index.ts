import { createRouter } from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";
import controller from "@/infra/controller";
import user from "@/models/user";
import session from "@/models/session";

interface Session {
  id: string;
  token: string;
  user_id: string;
  createdAt: Date;
  expiresAt: Date;
  [key: string]: any;
}

interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
  [key: string]: any;
}

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    const sessionToken = req.cookies.session_id;

    if (!sessionToken) {
      res.status(401).json({ message: "Sessão inválida ou não encontrada" });
      return;
    }

    const sessionObject: Session = await session.findOneValidByToken(sessionToken);
    const renewedSessionObject: Session = await session.renew(sessionObject.id);

    controller.setSessionCookie(renewedSessionObject.token, res);

    const userFound: User = await user.findOneById(sessionObject.user_id);

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, max-age=0, must-revalidate",
    );

    res.status(200).json(userFound);
  } catch (error: any) {
    console.error("Erro no getHandler:", error);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
}
