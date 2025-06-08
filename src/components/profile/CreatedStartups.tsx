import StartupCard from "~/components/ui/startup-card";

interface Startup {
  id: string;
  name: string;
  description: string;
  websiteUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  tags?: { id: number; name: string; }[];
  participants?: { id: string; name: string | null; username: string | null; }[];
}

interface CreatedStartupsProps {
  startups: Startup[];
}

export default function CreatedStartups(props: CreatedStartupsProps) {
  return (
    <StartupCard 
      startups={props.startups} 
      type="created" 
    />
  );
}