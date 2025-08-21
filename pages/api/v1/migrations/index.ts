import type { NextApiRequest, NextApiResponse } from "next";
import migrator from "@/models/migrator";


export default async function handler(req:NextApiRequest, res: NextApiResponse) {
  if(req.method === 'POST'){
    return postHandler(req, res);
  }else if (req.method === 'GET'){
   return getHandler(req, res)
  }
  else{
   return res.status(405).json({ message: "Method not allowed" });

  }
  
}

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return res.status(200).json(pendingMigrations);
}

async function postHandler(req: NextApiRequest , res: NextApiResponse) {
  const migratedMigrations = await migrator.runPendingMigrations();

  if (migratedMigrations.length > 0) {
    return res.status(201).json(migratedMigrations);
  }

  return res.status(200).json(migratedMigrations);
}