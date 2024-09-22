import HomeClient from "@/components/HomeClientnew";
import { getSession } from "@/utils/session";

/**
 * Home:
 * This is the server-side component that retrieves session data
 * and passes it to the client-side component for rendering.
 *
 * @returns JSX.Element
 */
export default async function Home() {
  const session = await getSession(); // Fetch the session data on the server

  return (
    // Pass session as a prop to the client-side component
    <HomeClient session={session} />
  );
}
