export default function HowItWorks() {
  return (
    <section id="how-it-works" class="py-20 bg-white">
      <div class="container mx-auto px-4 max-w-6xl">
        <h2 class="text-center mb-16 text-3xl md:text-4xl font-bold text-gray-800">Как работает StartupCoders.ru</h2>
        
        <div class="grid md:grid-cols-3 gap-10">
          <Step number={1} title="Создайте свой профиль" description="Покажите свои навыки, опыт и идеи для стартапа, чтобы привлечь похожих разработчиков." />
          <Step number={2} title="Свяжитесь с разработчиками" description="Просмотрите профили и свяжитесь с разработчиками, которые дополнят ваши навыки." />
          <Step number={3} title="Постройте свой стартап" description="Сформируйте свою команду, сотрудничайте над идеями и начните строить ваш продукт вместе." />
        </div>
      </div>
    </section>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div class="flex flex-col items-center text-center step">
      <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
        <span class="text-indigo-600 text-2xl font-bold">{number}</span>
      </div>
      <h3 class="mb-4 text-xl font-semibold text-gray-800">{title}</h3>
      <p class="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}