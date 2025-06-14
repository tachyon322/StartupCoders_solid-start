import Header from "~/components/landing/Header";
import { useSession } from "~/lib/auth/session-context";
import { getStartups } from "~/data/startup";
import { getAllTags } from "~/data/user";
import { A, useSearchParams } from "@solidjs/router";
import { createResource } from "solid-js";
import StartupList from "~/components/find/StartupList";
import StartupSearch from "~/components/find/StartupSearch";
import { Button } from "~/components/ui/button";

const PAGE_SIZE = 10;

export default function find() {
  const [searchParams] = useSearchParams();
  const sessionData = useSession();

  // Direct resource for tags without caching
  const [tagsResource] = createResource(() => getAllTags());

  // Direct resource for startups without caching
  const [startupsResource] = createResource(
    () => {
      const pageParam = searchParams.page;
      const queryParam = searchParams.q;
      const tagsParam = searchParams.tags;

      const pageStr = Array.isArray(pageParam) ? pageParam[0] : pageParam;
      const queryStr = Array.isArray(queryParam) ? queryParam[0] : queryParam;
      const tagsStr = Array.isArray(tagsParam) ? tagsParam[0] : tagsParam;

      const page = parseInt(pageStr || "1", 10) || 1;
      const tagIds = tagsStr
        ? tagsStr.split(",").map((id: string) => parseInt(id.trim(), 10)).filter((id: number) => !isNaN(id))
        : undefined;

      return {
        page,
        pageSize: PAGE_SIZE,
        searchQuery: queryStr || undefined,
        tagIds
      };
    },
    async (params) => {
      return getStartups(params.page, params.pageSize, params.searchQuery, params.tagIds);
    }
  );

  return (
    <div>
      <Header session={sessionData} />

      <div class="container mx-auto px-4 max-w-6xl">
        <div class="flex items-center gap-5">
          <h1 class="text-2xl font-bold mb-4 my-4">Найдите стартапы</h1>
          <A href="/create">
          <Button variant={"secondary"}>Создать</Button></A>
        </div>
        <StartupSearch availableTags={tagsResource() || []} />
        <div class="mt-6">
          <StartupList startupsResource={startupsResource} />
        </div>
      </div>
    </div>
  )
}
