import { Title } from "@solidjs/meta";
import { useSession } from "~/lib/auth/session-context";
import Header from "~/components/landing/Header";
import HeroSection from "~/components/landing/HeroSection";
import HowItWorks from "~/components/landing/HowItWorks";
import Features from "~/components/landing/Features";
import CTA from "~/components/landing/CTA";
import { createAsync } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { auth } from "~/lib/auth/auth";

export const meta = () => {
  return {
    title: "Startup Coders",
    description: "Welcome to my website!",
  };
};

// Server function to get session
async function getServerSession() {
  "use server";

  const event = getRequestEvent();
  if (!event) return null;

  try {
    const session = await auth.api.getSession({
      headers: event.request.headers
    });

    return session;
  } catch (error) {
    console.error("Server session error:", error);
    return null;
  }
}

export default function Home() {
  const sessionData = createAsync(() => getServerSession());
  return (
    <>
      <Title>Startup Coders</Title>
      <Header session={sessionData} />
      <HeroSection />
      <HowItWorks />
      <Features />
      <CTA />
    </>
  );
}
