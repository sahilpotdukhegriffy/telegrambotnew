import crypto from "crypto";

interface User {
  id?: string;
  username?: string;
  [key: string]: any; // Placeholder for other possible user fields
}

interface ValidatedData {
  [key: string]: string; // Dynamic key-value pairs representing validated Telegram data
}

interface ValidationResult {
  validatedData: ValidatedData | null; // The result of the validation, or null if failed
  user: User; // The user data extracted from the validated data
  message: string; // A message indicating success or failure of the validation
}

/**
 * This function validates the Telegram Web App data sent during the authentication process.
 * It ensures that the incoming data hasn't been tampered with by verifying the hash against
 * the secret bot token. If valid, the user's information is returned along with a success message.
 *
 * The validation checks if the data was sent within the last 5 minutes and that the hash matches
 * the expected value generated using the bot token.
 *
 * @param telegramInitData - The data sent from the Telegram Web App for authentication.
 * @returns An object containing the validation result, user data, and a message.
 */
export function validateTelegramWebAppData(
  telegramInitData: string
): ValidationResult {
  const BOT_TOKEN = process.env.BOT_TOKEN;

  let validatedData: ValidatedData | null = null;
  let user: User = {};
  let message = "";

  if (!BOT_TOKEN) {
    return { message: "BOT_TOKEN is not set", validatedData: null, user: {} };
  }

  // Parse the Telegram initialization data as URL parameters
  const initData = new URLSearchParams(telegramInitData);

  const hash = initData.get("hash"); //Hash: A cryptographic signature sent by Telegram(using BOT_TOKEN) to ensure the data is valid and hasn’t been altered.

  // If no hash is provided, the data is invalid or maybe tampered
  if (!hash) {
    return {
      message: "Hash is missing from initData",
      validatedData: null,
      user: {},
    };
  }

  initData.delete("hash");

  // Check if auth_date (the timestamp of when the authentication was initiated) exists
  const authDate = initData.get("auth_date");
  if (!authDate) {
    return {
      message: "auth_date is missing from initData",
      validatedData: null,
      user: {},
    };
  }

  // Ensure the Telegram data is not older than 5 minutes
  // It is a security measure to prevent replay attacks and ensure the authenticity of the Telegram Web App data.
  const authTimestamp = parseInt(authDate, 10);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const timeDifference = currentTimestamp - authTimestamp;
  const fiveMinutesInSeconds = 5 * 60;

  if (timeDifference > fiveMinutesInSeconds) {
    return {
      message: "Telegram data is older than 5 minutes",
      validatedData: null,
      user: {},
    };
  }

  // A string created from Telegram init data, excluding the hash. Key-value pairs are sorted and concatenated as "key=value", separated by newlines.
  const dataCheckString = Array.from(initData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  // The bot token is hashed with HMAC-SHA256 to generate a secret key for secure hashing.
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();

  // The dataCheckString is hashed using the secretKey to generate a calculatedHash, which is compared to the hash sent by Telegram to verify data integrity.
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  // If the calculated hash matches the received hash, the data is valid
  if (calculatedHash === hash) {
    validatedData = Object.fromEntries(initData.entries()); // Convert initData to an object
    message = "Validation successful";
    // Attempt to extract and parse the user data from the validated data
    const userString = validatedData["user"];
    if (userString) {
      try {
        user = JSON.parse(userString);
      } catch (error) {
        console.error("Error parsing user data:", error);
        message = "Error parsing user data";
        validatedData = null;
      }
    } else {
      message = "User data is missing";
      validatedData = null;
    }
  } else {
    message = "Hash validation failed";
  }

  return { validatedData, user, message };
}
