import { getShopForIdQueryOptions } from '@/api/shops'
import { TabFormCard } from '@/components/forms/tab-form'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/shops/$shopId/tab-request')({
  beforeLoad: () => ({ title: "Tab Request" }),
  component: TabRequestComponent
})

function TabRequestComponent() {
  const { shopId } = Route.useParams();
  const { data: shop } = useSuspenseQuery(getShopForIdQueryOptions(shopId))

  return <div className='p-4'>
    <TabFormCard shop={shop} />
  </div>
}
