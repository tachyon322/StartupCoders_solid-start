import { createMemo } from "solid-js";
import StartupCard from "~/components/ui/startup-card";

interface ParticipatingStartup {
  startup: {
    id: string;
    name: string;
    description: string;
    websiteUrl: string | null;
    createdAt: Date;
    creatorUser: string;
    tags?: { id: number; name: string; }[];
    creatorId?: {
      id: string;
      name: string | null;
      username: string | null;
      image: string | null;
    };
  };
}

interface ParticipatingStartupsProps {
  participatingStartups: ParticipatingStartup[];
}

export default function ParticipatingStartups(props: ParticipatingStartupsProps) {
  // Transform the data structure to match what StartupCard expects
  const transformedStartups = createMemo(() =>
    props.participatingStartups.map(item => ({
      id: item.startup.id,
      name: item.startup.name,
      description: item.startup.description,
      websiteUrl: item.startup.websiteUrl,
      createdAt: item.startup.createdAt,
      tags: item.startup.tags,
      creatorId: item.startup.creatorId
    }))
  );

  return (
    <StartupCard
      startups={transformedStartups()}
      type="participating"
    />
  );
}