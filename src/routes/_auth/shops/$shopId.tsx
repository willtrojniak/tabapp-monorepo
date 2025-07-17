import { ensureShopForId, getShopForIdQueryOptions } from '@/api/shops'
import { hasShopRole, shopRoles } from '@/util/authorization'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound, Outlet, Link } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_auth/shops/$shopId')({
  params: {
    parse: (params) => ({
      shopId: z.number().int().parse(Number(params.shopId)),
    }),
    stringify: ({ shopId }) => ({ shopId: `${shopId}` })
  },
  beforeLoad: async ({ context, params }) => {
    const data = await context.queryClient.fetchQuery(getShopForIdQueryOptions(params.shopId)).then(data => data).catch(() => {
      throw notFound();
    })
    return {
      title: data.name
    }
  },
  loader: async ({ context, params }) => {
    return await Promise.all([
      ensureShopForId(context.queryClient, params.shopId),
    ])
  },
  component: ShopLayoutComponent

})

function ShopLayoutComponent() {
  const { shopId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const { data: shop } = useSuspenseQuery(getShopForIdQueryOptions(shopId))

  return <div className='flex-auto w-full flex flex-row items-stretch'>
    <div className='px-4 py-6 bg-background border-r border-r-muted'>
      <ul className='font-light'>
        {hasShopRole(user, shop, shopRoles.MANAGE_ORDERS) &&
          <Link to={"/shops/$shopId/checkout"} params={{ shopId: shopId }}>
            <li className='py-1'>Checkout</li>
          </Link>
        }
        {hasShopRole(user, shop, shopRoles.READ_TABS) &&
          <Link to={"/shops/$shopId/tabs"} params={{ shopId: shopId }}>
            <li className='py-1'>Tabs</li>
          </Link>
        }
        {hasShopRole(user, shop, shopRoles.MANAGE_ORDERS) &&
          <Link to={"/shops/$shopId/items"} params={{ shopId: shopId }}>
            <li className='py-1'>Items</li>
          </Link>
        }
      </ul>
    </div>
    <div className='p-4 overflow-scroll'>
      <Outlet />
    </div>
  </div>

}
