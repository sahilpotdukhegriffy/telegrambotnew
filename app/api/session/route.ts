import { getSession } from "@/utils/session";
import { NextResponse } from "next/server";

/*
  GET:
  This function handles a GET request to check if the user is authenticated. 
  It retrieves the session from cookies using the getSession utility function. 
  If a valid session exists, it responds with isAuthenticated: true. 
  Otherwise, it responds with isAuthenticated: false and a 401 (Unauthorized) status code.
*/
export async function GET() {
  const session = await getSession();
  if (session) {
    return NextResponse.json({ isAuthenticated: true });
  } else {
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }
}
