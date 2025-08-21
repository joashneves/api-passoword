import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
  if(req.method === 'POST'){
    postHandler(req, res)
  }
  else{
    return res.status(405).json({ message: "Method not allowed" });

  }
  
}


async function postHandler(req:NextApiRequest, res: NextApiResponse) {
  const usersInputValues = req.body;
  const newUser = await user.create(usersInputValues);
  return res.status(201).json(newUser);
}