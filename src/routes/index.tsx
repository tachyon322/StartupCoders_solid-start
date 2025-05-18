import { Title } from "@solidjs/meta";
import { useSession } from "~/lib/auth/session-context";
import Header from "~/components/landing/Header";
import HeroSection from "~/components/landing/HeroSection";
import HowItWorks from "~/components/landing/HowItWorks";
import Features from "~/components/landing/Features";
import CTA from "~/components/landing/CTA";

export const meta = () => {
  return {
    title: "Startup Coders",
    description: "Welcome to my website!",
  };
};

export default function Home() {
  const sessionData = useSession();
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
