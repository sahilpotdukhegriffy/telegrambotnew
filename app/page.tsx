import TelegramAuth from "@/components/TelegramAuth";
import { getSession } from "@/utils/session";

export default async function Home() {
  const session = await getSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {/* {userData ? (
        <>
          <h1 className="text-2xl font-bold mb-4">User Data</h1>
          <ul>
            <li>ID: {userData.id}</li>
            <li>First Name: {userData.first_name}</li>
            <li>Last Name: {userData.last_name || "N/A"}</li>
            <li>Username: {userData.username || "N/A"}</li>
            <li>Language Code: {userData.language_code}</li>
            <li>Is Premium: {userData.is_premium ? "Yes" : "No"}</li>
          </ul>
        </>
      ) : (
        <div>Loading...</div>
      )} */}
      <h1 className="text-4xl font-bold mb-8">
        Jwt Authentication for Telegram Mini Apps
      </h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <TelegramAuth />
    </main>
  );
}
