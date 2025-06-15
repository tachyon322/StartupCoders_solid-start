

import { useNavigate } from '@solidjs/router';
import { Button } from '../ui/button';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <>
      <section
        class="bg-gradient-to-b from-indigo-950 to-indigo-900 text-white py-24"
      >
        <div class="container mx-auto px-4 max-w-6xl">
          <div class="flex flex-col md:flex-row items-center justify-between gap-10">
            <div class="md:w-1/2">
              <h1 class="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Найдите идеального <span class="text-indigo-300">партнера для стартапа</span>
              </h1>
              <p class="mb-8 text-indigo-100 text-xl md:text-2xl leading-relaxed">
                Свяжитесь с талантливыми разработчиками, готовыми построить что-то новое
              </p>
              <div class="flex gap-4 flex-wrap">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    console.log('Attempting navigation to /login');
                    try {
                      navigate('/login');
                    } catch (error) {
                      console.error('Navigation error:', error);
                    }
                  }}
                >
                  Присоединиться сейчас
                </Button>
              </div>
            </div>
            <div class="md:w-1/2">
              <div class="relative code-block">
                <div class="bg-indigo-800 rounded-xl p-4 sm:p-6 md:p-8 shadow-2xl">
                  <div class="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div class="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                    <div class="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                    <div class="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div class="overflow-x-auto">
                    <pre class="font-mono text-indigo-200 text-xs sm:text-sm whitespace-pre">
                      <code>{`// Finding the perfect partner
const startupCoders = {
  connect: () => developers.filter(dev =>
    dev.skills.match(yourNeeds) &&
    dev.goals.align(yourVision)
  ),
  build: (team) => team.createAwesomeProduct(),
  launch: (product) => market.disrupt(product)
};

// Ready to code together?
startupCoders.connect();`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}