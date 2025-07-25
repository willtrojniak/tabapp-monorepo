import { getShopItemForIdQueryOptions } from '@/api/items'
import { OrderFormDialog } from '@/components/forms/order-form'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  tab: z.number().min(1),
})

export const Route = createFileRoute('/_auth/shops/$shopId/_shopuser/checkout/$itemId/')({
  validateSearch: (search) => searchSchema.parse(search),
  component: ItemCheckoutComponent
})

function ItemCheckoutComponent() {
  const { tab, ...search } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { shopId, itemId } = Route.useParams()
  const { data: item } = useSuspenseQuery(getShopItemForIdQueryOptions(shopId, itemId))

  return <OrderFormDialog shopId={shopId} tabId={tab} item={item} open={true} onOpenChange={() => {
    navigate({ to: "/shops/$shopId/checkout", params: { shopId }, search: { tab, ...search }, replace: true })
  }} />
}
