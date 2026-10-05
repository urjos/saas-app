import CompanionCard from "@/components/CompanionCard";
import SearchInput from "@/components/SearchInput";
import SubjectFilter from "@/components/SubjectFilter";
import { getAllCompanions } from "@/lib/actions/companion.actions";
import { companionsSearchParamsSchema } from "@/lib/schemas/companion";
import { getSubjectColor } from "@/lib/utils";

const ComapanionsLibrary = async ({ searchParams }: SearchParams) => {
  const rawParams = await searchParams;
  const { subject = "", topic = "", page } = companionsSearchParamsSchema.parse(rawParams);

  const companions = await getAllCompanions({ subject, topic, page });

  return (
    <main>
      <section className="flex justify-between items-center gap-4 max-sm:flex-col">
        <h1>Companion Library</h1>
        <div className="flex gap-4">
          <SearchInput />
          <SubjectFilter />
        </div>
      </section>
      <section className="companions-grid">
        {companions.map((companion) => (
          <CompanionCard
            key={companion.id}
            {...companion}
            color={getSubjectColor(companion.subject)}
          />
        ))}
      </section>
    </main>
  );
};

export default ComapanionsLibrary;
