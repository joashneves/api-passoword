import type { NextApiRequest, NextApiResponse } from "next";
import user from "@/models/user";
import { ValidationError } from "@/infra/errors";
interface UserInput {
  username: string;
  email: string;
  password: string;
  [key: string]: any;
}

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
  // api/v1/users
  if(req.method === 'POST'){
    return postHandler(req, res)
  }
  else if(req.method === 'GET'){
        return getHandler(req, res);
  }
  else{
    return res.status(405).json({ message: "Method not allowed" });

  }
  
}

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const users = await user.findAll();
    return res.status(200).json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno" });
  }
}


async function postHandler(req:NextApiRequest, res: NextApiResponse) {
  try{
  const usersInputValues = req.body;
  console.log(usersInputValues)
  const newUser = await user.create(usersInputValues);
  return res.status(201).json(newUser);
    } catch (err: any) {
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json(err.toJSON());
    }
    console.error(err);
    return res.status(500).json({ message: "Erro interno" });
  }
}