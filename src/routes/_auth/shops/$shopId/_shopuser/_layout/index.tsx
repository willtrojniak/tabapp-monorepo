import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ShopFormCard } from '@/components/forms/shop-form'
import { PaymentMethod } from '@/types/types'
import { getShopForIdQueryOptions } from '@/api/shops'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { hasShopRole, shopRoles } from '@/util/authorization'
import { LocationFormDialog } from '@/components/forms/location-form'
import { CreateButton } from '@/components/ui/create-button'
import { DataTable } from '@/components/data-table'
import { useLocationColumns } from '@/components/location-table-columns'

export const Route = createFileRoute('/_auth/shops/$shopId/_shopuser/_layout/')({
  component: ShopComponent
})

function ShopComponent() {
  const { user } = Route.useRouteContext();
  const { shopId } = Route.useParams();
  const { data: shop } = useSuspenseQuery(getShopForIdQueryOptions(shopId))
  const locationCols = useLocationColumns(shopId)

  return <div className='flex flex-wrap gap-2'>
    <ShopFormCard shop={shop} paymentMethods={[PaymentMethod.in_person, PaymentMethod.chartstring]} />
    {
      hasShopRole(user, shop, shopRoles.MANAGE_LOCATIONS) &&
      <Card className='min-w-72 flex-grow basis-0'>
        <CardHeader>
          <CardTitle>Shop Locations</CardTitle>
          <CardDescription>Manage where tabs can be hosted.</CardDescription>
          <CardAction>
            <LocationFormDialog shopId={shopId}>
              <CreateButton> Create Location</CreateButton>
            </LocationFormDialog>
          </CardAction>
        </CardHeader>
        <CardContent>
          <DataTable columns={locationCols} data={shop.locations} />
        </CardContent>
      </Card>
    }
  </div>
}
