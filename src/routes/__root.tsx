import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanstackRouterDevtools } from '@/components/dev/TanstackRouterDevtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient } from "@tanstack/react-query";
import { Auth } from "../types/types";
import { Toaster } from "@/components/ui/toaster";
import { DndContext } from "@dnd-kit/core";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Suspense } from "react";

export const Route = createRootRouteWithContext<{
  auth: Auth
  queryClient: QueryClient,
  title: string
}>()({
  component: RootComponent,
});

function RootComponent() {
  return <DndContext>
    <div className="flex min-h-screen w-full, flex-col bg-muted/40 scroll-smooth">
      <div className="flex flex-col max-w-full sm:gap-4 sm:py-4">
        <main className="flex flex-col max-w-full gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
      <Suspense>
        <TanstackRouterDevtools position="bottom-right" />
      </Suspense>
      <ReactQueryDevtools position="left" />
      <div className="fixed bottom-2 left-2 text-xs text-muted-foreground opacity-10">{import.meta.env.DEV ? "DEV" : (import.meta.env.VITE_BUILD).substr(0, 7)}</div>     <Toaster />
      <div className="text-xs text-center p-2 mt-auto">
        Developed by <a href="https://www.willtrojniak.com" className="underline underline-offset-2">Will Trojniak</a>  </div>
    </div>
  </DndContext>
}
