

export default function Features() {


  return (
    <section id="features" class="py-20 bg-gray-50">
      <div class="container mx-auto px-4 max-w-6xl">
        <h2 class="text-center mb-16 text-3xl md:text-4xl font-bold text-gray-800">Почему стоит попробовать проект</h2>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon="🧩" 
            title="Подбор по навыкам" 
            description="Найдите разработчиков, которые имеют дополнительные навыки."
          />
          
          <FeatureCard 
            icon="🌐" 
            title="Глобальная сеть" 
            description="Свяжитесь с талантливыми разработчиками со всей страны, расширяя ваш потенциальный пул."
          />
          
          <FeatureCard 
            icon="🔒" 
            title="Простая коммуникация" 
            description="Предоставляем возможность связаться с разработчиками в различных социальных сетях"
          />

        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div class="bg-white p-6 rounded-lg shadow-md feature-card">
      <div class="text-indigo-600 mb-4">
        <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
          <span class="font-bold">{icon}</span>
        </div>
      </div>
      <h3 class="mb-3 text-xl font-semibold text-gray-800">{title}</h3>
      <p class="text-gray-600 leading-relaxed text-base">{description}</p>
    </div>
  );
} 