import { Title } from "@solidjs/meta";
import Header from "~/components/landing/Header"
import { useSession } from "~/lib/auth/session-context";


export default function Donate() {
  const session = useSession();
  return (
    <>
      <Title>Пожертвования | Startup Coders</Title>
      <Header session={session} />
      <main class="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 bg-white dark:bg-gray-950">
        <h1 class="text-3xl font-bold mb-6 text-center">Поддержите проект</h1>
        <div class="bg-gray-100 dark:bg-gray-900 rounded-xl shadow-md p-8 flex flex-col items-center max-w-md w-full">
          <img
            src="https://i.postimg.cc/L5K6S764/image.png"
            alt="QR для пожертвований"
            class="w-40 h-40 mb-6 rounded-lg border border-gray-300 dark:border-gray-800 bg-white"
          />
          <div class="mb-4 w-full">
            <div class="font-semibold text-lg mb-1">Номер карты</div>
            <div class="bg-white dark:bg-gray-800 rounded p-2 text-center font-mono text-lg select-all border border-gray-200 dark:border-gray-700">
              2200 7008 8783 7184
            </div>
            Денис Ч.
          </div>
          <div class="mb-4 w-full">
            <div class="font-semibold text-lg mb-1">Крипто-кошельки</div>
            <div class="bg-white dark:bg-gray-800 rounded p-2 text-sm font-mono select-all border border-gray-200 dark:border-gray-700 mb-1">BTC: bc1qexampleaddress1234567890</div>
            <div class="bg-white dark:bg-gray-800 rounded p-2 text-sm font-mono select-all border border-gray-200 dark:border-gray-700">ETH: 0xExampleEthereumAddress1234567890</div>
          </div>
          <p class="text-gray-500 text-xs mt-4 text-center">Спасибо за вашу поддержку! Все средства идут на развитие платформы.</p>
        </div>
      </main>
    </>
  );
}
