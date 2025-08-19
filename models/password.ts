import bcryptjs from "bcryptjs";

const PEPPER: string = process.env.PEPPER || "Bell_Pepper";

async function hash(password: string): Promise<string> {
  const rounds: number = getNumberOfRounds();
  const spicyPassword: string = password + PEPPER;
  return await bcryptjs.hash(spicyPassword, rounds);
}

function getNumberOfRounds(): number {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(
  providedPassword: string,
  storedPassword: string
): Promise<boolean> {
  const spicyProvidedPassword: string = providedPassword + PEPPER;
  return await bcryptjs.compare(spicyProvidedPassword, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
