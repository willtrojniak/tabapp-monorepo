import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ShopFormCard } from '@/components/forms/shop-form'
import { PaymentMethod } from '@/types/types'
import { getShopForIdQueryOptions } from '@/api/shops'

export const Route = createFileRoute('/_auth/shops/$shopId/_shopuser/_layout/')({
  component: ShopComponent
})

function ShopComponent() {
  const { shopId } = Route.useParams();
  const { data: shop } = useSuspenseQuery(getShopForIdQueryOptions(shopId))

  return <div className='flex flex-wrap gap-4'>
    <div>
      <ShopFormCard shop={shop} paymentMethods={[PaymentMethod.in_person, PaymentMethod.chartstring]} />
    </div>
  </div>
}
