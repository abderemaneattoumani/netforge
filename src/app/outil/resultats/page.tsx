import { Suspense } from "react";

import { ResultatsView } from "@/components/results/resultats-view";

export default function ResultatsPage() {
  return (
    <Suspense fallback={null}>
      <ResultatsView />
    </Suspense>
  );
}