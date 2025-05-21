import Header from "~/components/landing/Header";
import { useSession } from "~/lib/auth/session-context";
import { getStartups } from "~/data/startup";
import { createResource } from "solid-js";

const PAGE_SIZE = 10;

async function getAllStartups(pageStr: string, queryStr: string | undefined, tagsStr: string | undefined) {
  const page = parseInt(pageStr, 10) || 1;
    // Parse tag IDs if any
  const tagIds = tagsStr
    ? tagsStr.split(",").map((id) => parseInt(id, 10))
    : undefined;

  return getStartups(
    page,
    PAGE_SIZE,
    queryStr,
    tagIds
  );
}


export default function find() {
    const sessionData = useSession();
  return (
    <div>
        <Header session={sessionData} />
    </div>
  )
}
