import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req:NextApiRequest, res: NextApiResponse) {
  const userInputValues = req.body;
  if(req.method === 'POST'){}
  else{
    return res.status(405).json({ message: "Method not allowed" });

  }
  
}