import { ReproPage } from "@/components/repro-page";
import { TAGS } from "@/lib/tags";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <ReproPage path="/" tag={TAGS.home} />;
}
