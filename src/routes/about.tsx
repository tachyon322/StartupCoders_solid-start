import { Title } from "@solidjs/meta";
import { useSession } from "~/lib/auth/session-context";
import Header from "~/components/landing/Header";

export default function About() {
  const sessionData = useSession();

  return (
    <>
      <Header session={sessionData} />
      <main class="container mx-auto px-4 py-8 max-w-6xl">
        <Title>О нас</Title>
        <h1 class="text-3xl font-bold mb-6">О сайте</h1>
        
        <div class="">
          <p class="mb-4">
            Сайт создан на SolidStart фреймворке с использованием Drizzle, Betterauth. <br />
            Является некоммерческим проектом. <br />
            Мой тикток: <a href="https://t.me/yourusername" class="text-blue-500 hover:underline">@yourusername</a> <br />
            Мой телеграм: <a href="https://t.me/yourusername" class="text-blue-500 hover:underline">@yourusername</a> <br />
          </p>
        </div>
      </main>
    </>
  );
}
