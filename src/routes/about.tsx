import { Title } from "@solidjs/meta";
import { useSession } from "~/lib/auth/session-context";
import Header from "~/components/landing/Header";

export default function About() {
  const sessionData = useSession();

  return (
    <>
      <Header session={sessionData} />
      <main class="container mx-auto px-4 py-8 max-w-6xl">
        <Title>About</Title>
        <h1 class="text-3xl font-bold mb-6">About Us</h1>
        
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4">Our Mission</h2>
          <p class="mb-4">
            We're dedicated to connecting developers and startups to create amazing products together.
          </p>
          <p class="mb-4">
            Our platform helps talented developers find exciting projects and enables startups to
            discover the perfect technical talent for their needs.
          </p>
        </div>
      </main>
    </>
  );
}
