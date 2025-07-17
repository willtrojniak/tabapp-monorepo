import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ShopFormCard } from '@/components/forms/shop-form'
import { PaymentMethod } from '@/types/types'
import { getShopForIdQueryOptions } from '@/api/shops'
import { useLocationColumns } from '@/components/location-table-columns'
import { DataTable } from '@/components/data-table'
import { LocationFormDialog } from '@/components/forms/location-form'
import { CreateButton } from '@/components/ui/create-button'
import { useUserColumns } from '@/components/user-table-columns'
import { ShopUserFormDialog } from '@/components/forms/shop-user-form'
import { hasShopRole, shopRoles } from '@/util/authorization'

export const Route = createFileRoute('/_auth/shops/$shopId/')({
  component: ShopComponent
})

function ShopComponent() {
  const { shopId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const { data: shop } = useSuspenseQuery(getShopForIdQueryOptions(shopId))

  const locationCols = useLocationColumns(shopId)
  const userCols = useUserColumns(shopId)


  return <div className='flex flex-wrap gap-4'>
    <div>
      <ShopFormCard shop={shop} paymentMethods={[PaymentMethod.in_person, PaymentMethod.chartstring]} />
    </div>
    {hasShopRole(user, shop, shopRoles.MANAGE_LOCATIONS) &&
      <Card className='sm:max-w-full'>
        <CardHeader>
          <CardTitle>Shop Locations</CardTitle>
          <CardDescription>Manage where tabs can be hosted.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={locationCols} data={shop.locations} />
        </CardContent>
        <CardFooter>
          <LocationFormDialog shopId={shopId}>
            <CreateButton> Create Location</CreateButton>
          </LocationFormDialog>
        </CardFooter>
      </Card>
    }
    {user.id === shop.owner_id &&
      <Card className='sm:max-w-full'>
        <CardHeader>
          <CardTitle>Shop Users</CardTitle>
          <CardDescription>Manage users and their permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={userCols} data={shop.users} />
        </CardContent>
        <CardFooter>
          <ShopUserFormDialog shopId={shopId}>
            <CreateButton>Add User</CreateButton>
          </ShopUserFormDialog>
        </CardFooter>
      </Card>
    }
  </div>
}
