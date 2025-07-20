import { NavigationMenu, NavigationMenuLink } from '@/components/ui/navigation-menu'
import { } from '@/components/ui/tabs'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createFileRoute('/_auth/shops/$shopId/_layout')({
  component: ShopIndexLayoutComponent,
  beforeLoad: () => ({ title: "" })
})

function ShopIndexLayoutComponent() {
  const { shopId } = Route.useParams()

  return <div>
    <NavigationMenu className='bg-muted px-1 py-1 mb-2 rounded-md'>
      <NavigationMenuLink asChild>
        <Link to='/shops/$shopId' params={{ shopId }}
          className='px-2 py-1 rounded-sm hover:cursor-pointer underline-offset-2' activeProps={{ className: "bg-background" }} activeOptions={{ exact: true }}>
          Edit
        </Link>
      </NavigationMenuLink>
      <NavigationMenuLink asChild>
        <Link to='/shops/$shopId/locations' params={{ shopId }}
          className='px-2 py-1 rounded-sm hover:cursor-pointer underline-offset-2' activeProps={{ className: "bg-background" }} activeOptions={{ exact: true }}>
          Locations
        </Link>
      </NavigationMenuLink>
      <NavigationMenuLink asChild>
        <Link to='/shops/$shopId/users' params={{ shopId }}
          className='px-2 py-1 rounded-sm hover:cursor-pointer underline-offset-2' activeProps={{ className: "bg-background" }} activeOptions={{ exact: true }}>
          Users
        </Link>
      </NavigationMenuLink>
      <NavigationMenuLink asChild>
        <Link to='/shops/$shopId/integrations' params={{ shopId }}
          className='px-2 py-1 rounded-sm hover:cursor-pointer underline-offset-2' activeProps={{ className: "bg-background" }} activeOptions={{ exact: true }}>
          Integrations
        </Link>
      </NavigationMenuLink>
    </NavigationMenu>
    <Suspense fallback={"Loading..."}>
      <Outlet />
    </Suspense>
  </div>
}
