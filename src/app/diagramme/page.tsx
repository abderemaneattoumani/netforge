import { Suspense } from "react";

import { TopologieView } from "@/components/diagram/topologie-view";

export default function DiagrammePage() {
  return (
    <Suspense fallback={null}>
      <TopologieView />
    </Suspense>
  );
}