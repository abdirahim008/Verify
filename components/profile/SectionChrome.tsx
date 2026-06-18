"use client";

import { createContext, useContext } from "react";

// When a SectionCard renders inside the ProfileWorkspace (left-sidebar
// layout), it shows one section at a time — so the card should be
// permanently expanded with no collapse chevron. Plain stacked usage
// (e.g. anywhere outside the workspace) keeps the normal collapsible
// behaviour. This context is the switch.
export const WorkspaceMode = createContext(false);

export function useWorkspaceMode() {
  return useContext(WorkspaceMode);
}
