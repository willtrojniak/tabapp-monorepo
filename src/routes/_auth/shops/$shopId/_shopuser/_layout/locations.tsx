import { getShopForIdQueryOptions } from '@/api/shops';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useLocationColumns } from '@/components/location-table-columns';
import { hasShopRole, shopRoles } from '@/util/authorization';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/data-table';
import { LocationFormDialog } from '@/components/forms/location-form';
import { CreateButton } from '@/components/ui/create-button';

export const Route = createFileRoute('/_auth/shops/$shopId/_shopuser/_layout/locations')({
  beforeLoad: () => ({ title: "Locations" }),
  component: ShopLocationsComponent
})

function ShopLocationsComponent() {
  const { shopId } = Route.useParams();
  const { user } = Route.useRouteContext();

  const { data: shop } = useSuspenseQuery(getShopForIdQueryOptions(shopId))
  const locationCols = useLocationColumns(shopId)

  return hasShopRole(user, shop, shopRoles.MANAGE_LOCATIONS) ?
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
    </Card> :
    <h2>Error 403: Forbidden</h2>
}
