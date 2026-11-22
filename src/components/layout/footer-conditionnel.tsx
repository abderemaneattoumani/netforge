"use client";

import type { ReactNode } from "react";

import { usePathname } from "next/navigation";

interface FooterConditionnelProps {
  children: ReactNode;
}

export function FooterConditionnel({ children }: FooterConditionnelProps) {
  const chemin = usePathname();

  if (chemin.startsWith("/outil/resultats")) {
    return null;
  }

  return <>{children}</>;
}