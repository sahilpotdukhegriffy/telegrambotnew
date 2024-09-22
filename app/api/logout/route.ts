import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/*
  POST:
  Handles user logout by removing the session cookie. 
  The session is invalidated by setting its expiration date to the past.
  Returns a success message after logout.
*/
export async function POST() {
  // Remove the session cookie by setting it with an expired date
  cookies().set("session", "", { expires: new Date(0), httpOnly: true });

  return NextResponse.json({ message: "Logout successful" });
}
