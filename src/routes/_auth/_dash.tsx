import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { NavigationMenu, NavigationMenuLink } from '@/components/ui/navigation-menu'
import { Suspense } from 'react'

export const Route = createFileRoute('/_auth/_dash')({
  beforeLoad: () => ({ title: "" }),
  component: Page
})

function Page() {

  ;

  return <div className='p-4'>
    <NavigationMenu className='bg-muted px-1 py-1 mb-2 rounded-md'>
      <NavigationMenuLink asChild>
        <Link to='/dash' mask={{ to: '/' }}
          className='px-2 py-1 rounded-sm hover:cursor-pointer underline-offset-2' activeProps={{ className: "bg-background" }} activeOptions={{ exact: true }}>
          Overview
        </Link>
      </NavigationMenuLink>
      <NavigationMenuLink asChild>
        <Link to='/tabs'
          className='px-2 py-1 rounded-sm hover:cursor-pointer underline-offset-2' activeProps={{ className: "bg-background" }} activeOptions={{ exact: true }}>
          Tabs
        </Link>
      </NavigationMenuLink>
      <NavigationMenuLink asChild>
        <Link to='/shops/'
          className='px-2 py-1 rounded-sm hover:cursor-pointer underline-offset-2' activeProps={{ className: "bg-background" }} activeOptions={{ exact: true }}>
          Shops
        </Link>
      </NavigationMenuLink>
      <NavigationMenuLink asChild>
        <Link to='/profile'
          className='px-2 py-1 rounded-sm hover:cursor-pointer underline-offset-2' activeProps={{ className: "bg-background" }} activeOptions={{ exact: true }}>
          Profile
        </Link>
      </NavigationMenuLink>
    </NavigationMenu>
    <Suspense>
      <Outlet />
    </Suspense>
  </div>
}
