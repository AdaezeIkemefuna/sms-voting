import Ably from "ably/promises";

export default async function handler(req, res) {
  // Unpack the SMS details from the request query string
  const incomingData = getSmsDetails(req, res);

  // If the request was invalid, return status 400.
  if (!incomingData.success) {
    res.status(400).end();
    return;
  }

  // Create an Ably client, get our `sms-notifications` channel
  const API_KEY = process.env.ABLY_API_KEY;
  const client = new Ably.Realtime(API_KEY);
  const channel = client.channels.get("sms-notifications");

  // Publish our SMS contents as an Ably message for the browser
  await channel.publish({ name: "smsEvent", data: incomingData });

  // Return the received data as a 200 OK for debugging.
  res.send(incomingData);
  res.status(200).end();
}

function getSmsDetails(req, res) {
  const params = req.query;

  console.log(params);
  if (!params.to || !params.msisdn) {
    console.log("This is not a valid inbound SMS message!");
    return { success: false };
  }

  return {
    success: true,
    messageId: params.messageId,
    from: params.msisdn,
    text: params.text,
    type: params.type,
    timestamp: params["message-timestamp"],
  };
}
