import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.info("Received revalidation request");
  // Check for secret to confirm this is a valid request
  // if (req.headers["x-pcc-webhook-secret"] !== process.env.REVALIDATION_SECRET) {
  //   console.error("Invalid token in revalidation request, rejecting request");
  //   return res.status(401).json({ message: "Invalid token" });
  // }

  try {
    // Revalidate the index page and articles page
    await Promise.all([res.revalidate("/"), res.revalidate("/articles")]);
    console.info("Successfully revalidated index page and articles page");
    return res.json({ revalidated: true });
  } catch (err) {
    console.error("Error revalidating index page and articles page", err);
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).send("Error revalidating");
  }
}
