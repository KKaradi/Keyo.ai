import { NextApiRequest, NextApiResponse } from "next";
import { authenticate, response } from "../helpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method !== "GET") return response(res, "onlyGet");
  if (!authenticate(req)) return response(res, "authError");
}
