//This file handles JWT creation, decryption, and session management.

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const key = new TextEncoder().encode(process.env.JWT_SECRET);

export const SESSION_DURATION = 60 * 60 * 1000; //1 hour (in milliseconds)

/**
 * Encrypts the payload (typically user data) into a signed JWT.
 * The JWT contains the payload, an issued at timestamp, and an expiration time of 1 hour.
 * This function returns the signed JWT, which can be used to manage user sessions securely.
 *
 * @param payload - Data to be included in the JWT, such as user details.
 * @returns A signed JWT string.
 */
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 hour")
    .sign(key);
}

/**
 * Decrypts and verifies the JWT.
 * This function verifies the token's signature using the secret key
 * and retrieves the payload (i.e., user data) from the token.
 *
 * @param input - The JWT string to be decrypted and verified.
 * @returns The payload from the decrypted JWT.
 */
export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

/**
 * Retrieves the current session from cookies.
 * This function fetches the "session" cookie from the incoming request and decrypts it
 * using the `decrypt` function. If no session is found, it returns null.
 *
 * @returns The decrypted session data if a valid session exists, or null otherwise.
 */
export async function getSession() {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

/**
 * Updates the session expiration by refreshing the session token.
 * If the session exists, it extends the session duration (expiration time)
 * by generating a new JWT with the same user data but a new expiration time.
 * The updated session is then stored as a new cookie.
 *
 * @param request - The incoming request object containing the session cookie.
 * @returns A Next.js response object with the updated session cookie.
 */
export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + SESSION_DURATION);
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true, // HTTP-only ensures cookies can't be accessed via client-side JavaScript (security feature)
    expires: parsed.expires,
  });
  return res;
}
