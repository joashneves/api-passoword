import { UnauthorizedError } from "@/infra/errors";
import password from "./password";
import user from "./user";

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role?: string;
  [key: string]: any;
}

async function getAuthenticatedUser(
  providedEmail: string,
  providedPassword: string,
): Promise<User> {
  try {
    console.log(`Email fornecido: ${providedEmail}`);

    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos",
      });
    }
    console.error(error);
    throw error;
  }

  async function findUserByEmail(providedEmail: string): Promise<User> {
    try {
      const storedUser = await user.findOneByEmail(providedEmail);
      if (!storedUser) {
        throw new UnauthorizedError({
          message: "Email não confere.",
          action: "Verifique se os dados enviados estão corretos",
        });
      }
      return storedUser as User;
    } catch {
      throw new UnauthorizedError({
        message: "Email não confere.",
        action: "Verifique se os dados enviados estão corretos",
      });
    }
  }

  async function validatePassword(
    providedPassword: string,
    storedPassword: string,
  ): Promise<void> {
    const correctPasswordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se os dados enviados estão corretos",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
