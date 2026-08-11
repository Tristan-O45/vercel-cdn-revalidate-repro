import { ReproPage } from "@/components/repro-page";
import { TAGS } from "@/lib/tags";

export const dynamic = "force-dynamic";

export default function RoutePage() {
  return <ReproPage path="/route" tag={TAGS.route} />;
}
