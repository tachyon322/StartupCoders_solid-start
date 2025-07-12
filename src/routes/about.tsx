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
            Сайт создан на SolidStart фреймворке с использованием Betterauth, запросы на чистом sql <br />
            Является некоммерческим проектом. <br />
            <span class="text-red-400">САЙТ В ЛИЦЕ МЕНЯ НЕ НЕСЕТ ОТВЕТСТВЕННОСТИ ЗА ИНФОРМАЦИЮ ЗАГРУЖАЕМУЮ НА САЙТ!</span> <br />
            Мой тикток: <a href="https://www.tiktok.com/@dens30451?_t=ZN-8xCf79Njmg2&_r=1" class="text-blue-500 hover:underline">@dens30451</a> <br />
            Мой телеграм: <a href="https://t.me/QTSJSMA" class="text-blue-500 hover:underline">@QTSJSMA</a> <br />
          </p>
        </div>
      </main>
    </>
  );
}
