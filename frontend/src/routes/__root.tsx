import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { TanstackRouterDevtools } from '@/components/dev/TanstackRouterDevtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient } from "@tanstack/react-query";
import { Auth } from "../types/types";
import { Toaster } from "@/components/ui/toaster";
import { DndContext } from "@dnd-kit/core";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Suspense } from "react";
import { ClipboardList, Store, User } from "lucide-react";

export const Route = createRootRouteWithContext<{
  auth: Auth
  queryClient: QueryClient,
  title: string
}>()({
  component: RootComponent,
});

function RootComponent() {
  return <DndContext>
    <div className="flex flex-col min-h-screen w-full bg-muted/40 scroll-smooth">
      <div className="flex-shrink flex-grow-0 w-full basis-auto flex flex-row justify-between items-center px-6 py-4 border-b-2 border-muted">
        <Breadcrumbs />
        <div className="flex flex-row gap-4 items-center">
          <Link to="/tabs"> <ClipboardList className="size-6" /></Link>
          <Link to="/shops"> <Store className="size-6" /></Link>
          <Link to="/profile"> <div className="bg-muted border p-1 rounded-full"><User className="size-6" /></div></Link>
        </div>
      </div>
      <main className="flex-auto max-w-full w-full flex flex-col">
        <Outlet />
      </main>
    </div>
    <Suspense>
      <TanstackRouterDevtools position="bottom-left" />
    </Suspense>
    <Toaster />
    <ReactQueryDevtools position="left" />
    <div className="fixed bottom-2 right-2 text-xs text-muted-foreground opacity-10">{import.meta.env.DEV ? "DEV" : (import.meta.env.VITE_BUILD).substr(0, 7)}</div>
    <div className="fixed bottom-2 left-2 text-xs p-2 w-full">
      Developed by <a href="https://www.willtrojniak.com" className="underline underline-offset-2">Will Trojniak</a>  </div>
  </DndContext>
}
