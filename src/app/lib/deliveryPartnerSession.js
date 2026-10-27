
import { createHmac, timingSafeEqual } from "crypto";

const getSecret = () => {
  const secret = process.env.DELIVERY_PARTNER_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("Delivery partner session secret is missing.");
  }

  return secret;
};

export function createDeliveryPartnerSession(partner) {
  const payload = Buffer.from(
    JSON.stringify({
      id: partner._id.toString(),
      email: partner.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    })
  ).toString("base64url");

  const signature = createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function verifyDeliveryPartnerSession(token) {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payload, signature] = parts;

    const expectedSignature = createHmac("sha256", getSecret())
      .update(payload)
      .digest();

    const receivedSignature = Buffer.from(signature, "base64url");

    if (
      receivedSignature.length !== expectedSignature.length ||
      !timingSafeEqual(receivedSignature, expectedSignature)
    ) {
      return null;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (!session.id || !session.exp) return null;

    if (session.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
