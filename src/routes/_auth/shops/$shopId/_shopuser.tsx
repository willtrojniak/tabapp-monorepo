import { createFileRoute, notFound, redirect, Outlet, Link } from '@tanstack/react-router'
import { getShopForIdQueryOptions } from '@/api/shops'
import { hasShopRole, shopRoles } from '@/util/authorization'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense } from 'react'

export const Route = createFileRoute('/_auth/shops/$shopId/_shopuser')({
  beforeLoad: async ({ context, params }) => {
    const shop = await context.queryClient.fetchQuery(getShopForIdQueryOptions(params.shopId)).then(data => data).catch(() => {
      throw notFound()
    })

    if (!shop.users.find(v => v.id === context.user.id)) {
      throw redirect({
        to: `/shops/${params.shopId}/tab-request`,
        replace: true,
      })
    }
  },
  component: ShopLayoutComponent
})

function ShopLayoutComponent() {
  const { shopId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const { data: shop } = useSuspenseQuery(getShopForIdQueryOptions(shopId))

  return <div className='flex-auto w-full flex flex-row items-stretch'>
    <div className='flex flex-col items-start px-4 py-6 bg-background border-r border-r-muted shrink-0 font-light text-sm underline-offset-2'>
      <Link to={"/shops/$shopId"} params={{ shopId: shopId }}
        className='w-fit py-2 text-base font-bold hover:underline'>
        Shop Settings
      </Link>
      {hasShopRole(user, shop, shopRoles.MANAGE_ORDERS) &&
        <Link to={"/shops/$shopId/checkout"} params={{ shopId: shopId }}
          className='py-2 hover:underline'
          activeProps={{ className: "underline" }}>
          Checkout
        </Link>
      }
      {hasShopRole(user, shop, shopRoles.READ_TABS) &&
        <Link to={"/shops/$shopId/tabs"} params={{ shopId: shopId }}
          className='py-2 hover:underline'
          activeProps={{ className: "underline" }}>
          Tabs
        </Link>
      }
      {hasShopRole(user, shop, shopRoles.MANAGE_ORDERS) &&
        <Link to={"/shops/$shopId/items"} params={{ shopId: shopId }}
          className='py-2 hover:underline'
          activeProps={{ className: "underline" }}>
          Items
        </Link>
      }
    </div>
    <div className='p-4 overflow-scroll'>
      <Suspense>
        <Outlet />
      </Suspense>
    </div>
  </div>

}
