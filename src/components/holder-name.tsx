"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type LiveHolderName = { name: string | null; setName: (name: string) => void };

const LiveHolderNameContext = createContext<LiveHolderName | null>(null);

/**
 * Lets a name saved on the page show up at once wherever it is printed
 * (the certificate), without re-rendering the route.
 */
export function HolderNameProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState<string | null>(null);
  const value = useMemo(() => ({ name, setName }), [name]);
  return <LiveHolderNameContext.Provider value={value}>{children}</LiveHolderNameContext.Provider>;
}

/** The holder's name: the one just saved on this page, else the server's. */
export function HolderName({ initial }: { initial: string }) {
  return <>{useContext(LiveHolderNameContext)?.name ?? initial}</>;
}

export function useSetHolderName() {
  return useContext(LiveHolderNameContext)?.setName ?? null;
}
