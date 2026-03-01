import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { NavigationMenu, NavigationMenuLink } from '@/components/ui/navigation-menu'
import { Suspense } from 'react'

export const Route = createFileRoute('/_auth/shops/$shopId/_shopuser/items')({
  beforeLoad: () => ({ title: "Items" }),
  component: ItemsComponent
})

function ItemsComponent() {
  const { shopId } = Route.useParams();
  const search = Route.useSearch();
  return <>
    <NavigationMenu className='flex-grow-0 bg-muted px-1 py-1 mb-2 rounded-md'>
      <NavigationMenuLink asChild>
        <Link to='/shops/$shopId/items' params={{ shopId }}
          className='px-2 py-1 rounded-sm hover:cursor-pointer underline-offset-2' activeProps={{ className: "bg-background" }} activeOptions={{ exact: true }}>
          Overview
        </Link>
      </NavigationMenuLink>
      <NavigationMenuLink asChild>
        <Link to='/shops/$shopId/items/categories' params={{ shopId }}
          search={search}
          className='px-2 py-1 rounded-sm hover:cursor-pointer underline-offset-2' activeProps={{ className: "bg-background" }} activeOptions={{ exact: true }}>
          Categories
        </Link>
      </NavigationMenuLink>
      <NavigationMenuLink asChild>
        <Link to='/shops/$shopId/items/substitutions' params={{ shopId }}
          className='px-2 py-1 rounded-sm hover:cursor-pointer underline-offset-2' activeProps={{ className: "bg-background" }}>
          Substitutions
        </Link>
      </NavigationMenuLink>
    </NavigationMenu>
    <Suspense fallback={"Loading..."}>
      <Outlet />
    </Suspense>
  </>
}
