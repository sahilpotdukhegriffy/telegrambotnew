import { NextResponse } from "next/server";
import { validateTelegramWebAppData } from "@/utils/telegramAuth";
import { cookies } from "next/headers";
import { encrypt, SESSION_DURATION } from "@/utils/session";

/*
  POST:
  This function handles the POST request for authenticating users via the Telegram Web App. 
  It extracts the Telegram initialization data from the request, validates it, and, if valid, 
  creates a new session for the user by encrypting their data and storing it in a session cookie.
*/
export async function POST(request: Request) {
  const { initData } = await request.json();

  // Validate the Telegram data to ensure it is legitimate and not tampered with
  const validationResult = validateTelegramWebAppData(initData);

  // If validation is successful, proceed with creating the session
  if (validationResult.validatedData) {
    console.log("Validation result: ", validationResult.user.username);
    const user = {
      telegramId: validationResult.user.id,
      username: validationResult.user.username,
      name: JSON.parse(validationResult.validatedData["user"]).first_name,
    };
    console.log(JSON.parse(validationResult.validatedData["user"]).first_name);

    // Create a new session
    const expires = new Date(Date.now() + SESSION_DURATION);
    const session = await encrypt({ user, expires });

    // Save the encrypted session data in a cookie with an expiration time and HTTP-only protection
    cookies().set("session", session, { expires, httpOnly: true });

    return NextResponse.json({ message: "Authentication successful" });
  } else {
    return NextResponse.json(
      { message: validationResult.message },
      { status: 401 }
    );
  }
}
