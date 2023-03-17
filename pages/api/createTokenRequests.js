import Ably from "ably/promises";

export default async function createToken(req, res) {
  const API_KEY = process.env.ABLY_API_KEY;
  const client = new Ably.Realtime(API_KEY);
  const tokenRequestData = await client.auth.createTokenRequest({
    clientId: "voting-demo",
  });
  res.status(200).json(tokenRequestData);
}
