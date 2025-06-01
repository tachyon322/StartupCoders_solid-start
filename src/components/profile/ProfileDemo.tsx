import EditableProfileHeader from "./EditableProfileHeader";
import ProfileStats from "./ProfileStats";
import CreatedStartups from "./CreatedStartups";
import ParticipatingStartups from "./ParticipatingStartups";
import UserTags from "./UserTags";

// Sample data for demonstration
const sampleUser = {
  id: "1",
  username: "john_doe",
  name: "John Doe",
  email: "john.doe@example.com",
  emailVerified: true,
  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  description: "Опытный разработчик с 5+ годами опыта в создании веб-приложений. Увлекаюсь стартапами и инновационными технологиями.",
  createdAt: new Date("2023-01-15"),
  updatedAt: new Date("2024-12-01")
};

const sampleCreatedStartups = [
  {
    id: "1",
    name: "EcoTracker",
    description: "Приложение для отслеживания углеродного следа и экологических привычек",
    websiteUrl: "https://ecotracker.example.com",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-11-20"),
    tags: [
      { id: 1, name: "Экология" },
      { id: 2, name: "Мобильные приложения" },
      { id: 3, name: "React Native" }
    ],
    participants: [
      { id: "2", name: "Alice Smith", username: "alice_dev" },
      { id: "3", name: "Bob Johnson", username: "bob_design" }
    ]
  },
  {
    id: "2",
    name: "FinanceBot",
    description: "AI-помощник для управления личными финансами и инвестициями",
    websiteUrl: null,
    createdAt: new Date("2024-06-10"),
    updatedAt: new Date("2024-12-01"),
    tags: [
      { id: 4, name: "FinTech" },
      { id: 5, name: "AI" },
      { id: 6, name: "Python" }
    ],
    participants: [
      { id: "4", name: "Carol White", username: "carol_ai" }
    ]
  }
];

const sampleParticipatingStartups = [
  {
    startup: {
      id: "3",
      name: "HealthSync",
      description: "Платформа для синхронизации медицинских данных между врачами и пациентами",
      websiteUrl: "https://healthsync.example.com",
      createdAt: new Date("2024-02-20"),
      creatorUser: "5",
      tags: [
        { id: 7, name: "HealthTech" },
        { id: 8, name: "Медицина" },
        { id: 9, name: "Node.js" }
      ],
      creatorId: {
        id: "5",
        name: "Dr. Sarah Wilson",
        username: "dr_sarah",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
      }
    }
  }
];

const sampleTags = [
  { tag: { id: 1, name: "JavaScript" } },
  { tag: { id: 2, name: "React" } },
  { tag: { id: 3, name: "Node.js" } },
  { tag: { id: 4, name: "TypeScript" } },
  { tag: { id: 5, name: "UI/UX Design" } },
  { tag: { id: 6, name: "Product Management" } },
  { tag: { id: 7, name: "Стартапы" } },
  { tag: { id: 8, name: "Инновации" } }
];

export default function ProfileDemo() {
  return (
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-8 max-w-6xl">
        <div class="space-y-6">
          {/* Editable Profile Header */}
          <EditableProfileHeader
            user={sampleUser}
            isOwner={true}
            onSave={async (data) => {
              console.log("Demo save:", data);
              // In demo, just log the data
            }}
          />
          
          {/* Statistics Overview */}
          <ProfileStats
            createdStartupsCount={sampleCreatedStartups.length}
            participatingStartupsCount={sampleParticipatingStartups.length}
            tagsCount={sampleTags.length}
            requestsCount={0}
            joinDate={sampleUser.createdAt}
          />
          
          {/* Main Content Grid */}
          <div class="grid lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div class="lg:col-span-2 space-y-6">
              {/* Created Startups */}
              <CreatedStartups startups={sampleCreatedStartups} />
              
              {/* Participating Startups */}
              <ParticipatingStartups participatingStartups={sampleParticipatingStartups} />
            </div>
            
            {/* Right Column - 1/3 width */}
            <div class="space-y-6">
              {/* User Tags */}
              <UserTags tags={sampleTags} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}