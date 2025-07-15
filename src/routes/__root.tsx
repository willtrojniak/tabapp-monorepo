import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { TanstackRouterDevtools } from '@/components/dev/TanstackRouterDevtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient } from "@tanstack/react-query";
import { Auth } from "../types/types";
import { Toaster } from "@/components/ui/toaster";
import { DndContext } from "@dnd-kit/core";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Suspense } from "react";
import { Store, User } from "lucide-react";

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
          <div className="flex flex-row justify-between">
            <Breadcrumbs />
            <div className="flex flex-row gap-4 items-center">
              <Link to="/shops"> <Store className="size-6" /></Link>
              <Link to="/profile"> <div className="bg-muted border p-1 rounded-full"><User className="size-8" /></div></Link>
            </div>
          </div>
          <Outlet />
        </main>
      </div>
      <Suspense>
        <TanstackRouterDevtools position="bottom-left" />
      </Suspense>
      <Toaster />
      <ReactQueryDevtools position="left" />
      <div className="fixed bottom-2 right-2 text-xs text-muted-foreground opacity-10">{import.meta.env.DEV ? "DEV" : (import.meta.env.VITE_BUILD).substr(0, 7)}</div>
      <div className="text-xs p-2 mt-auto">
        Developed by <a href="https://www.willtrojniak.com" className="underline underline-offset-2">Will Trojniak</a>  </div>
    </div>
  </DndContext>
}
