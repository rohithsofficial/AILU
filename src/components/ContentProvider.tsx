"use client";
import { createContext, useContext } from "react";
import type { ClientContent } from "@/server/cms";

const ContentContext = createContext<ClientContent | null>(null);

export default function ContentProvider({ value, children }: { value: ClientContent; children: React.ReactNode }) {
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const content = useContext(ContentContext);
  if (!content) throw new Error("useContent must be used inside ContentProvider.");
  return content;
}
