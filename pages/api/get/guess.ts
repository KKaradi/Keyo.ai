import type { NextApiRequest, NextApiResponse } from "next";
import { authenticate, response } from "../helpers";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  console.log(req.body);
  res.status(200).json({ name: new Date().toISOString() });
}
