import { Card, CardContent } from "~/components/ui/card";

interface ProfileStatsProps {
  createdStartupsCount: number;
  participatingStartupsCount: number;
  tagsCount: number;
  requestsCount: number;
  joinDate: Date;
}

export default function ProfileStats(props: ProfileStatsProps) {
  const getDaysActive = () => {
    const now = new Date();
    const joinDate = new Date(props.joinDate);
    const diffInMs = now.getTime() - joinDate.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  };

  const formatJoinDate = () => {
    return new Date(props.joinDate).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stats = [
    {
      label: "Созданных стартапов",
      value: props.createdStartupsCount,
      icon: (
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
        </svg>
      ),
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      label: "Участвует в проектах",
      value: props.participatingStartupsCount,
      icon: (
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      label: "Навыков и тегов",
      value: props.tagsCount,
      icon: (
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
        </svg>
      ),
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      label: "Отправленных заявок",
      value: props.requestsCount,
      icon: (
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
        </svg>
      ),
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <Card class="w-full">
      <CardContent class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Статистика профиля</h2>
        </div>
        
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div class={`relative p-4 rounded-lg border ${stat.bgColor} ${stat.borderColor} hover:shadow-sm transition-all duration-200`}>
              <div class="flex items-center justify-between mb-2">
                <div class={`p-2 rounded-md ${stat.color} ${stat.bgColor}`}>
                  {stat.icon}
                </div>
                <div class="text-right">
                  <p class={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
              <p class="text-sm font-medium text-gray-700">{stat.label}</p>
            </div>
          ))}
        </div>
        
        <div class="mt-6 pt-4 border-t border-gray-200">
          <div class="flex items-center justify-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
            <span class="font-medium">{getDaysActive()}</span>
            <span>дней активности на платформе</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}