import Header from "~/components/landing/Header";
import { useSession } from "~/lib/auth/session-context";


export default function find() {
    const sessionData = useSession();
  return (
    <div>
        <Header session={sessionData} />
    </div>
  )
}
