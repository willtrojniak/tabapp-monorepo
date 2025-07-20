import { getShopForIdQueryOptions } from '@/api/shops';
import { DataTable } from '@/components/data-table';
import { ShopUserFormDialog } from '@/components/forms/shop-user-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateButton } from '@/components/ui/create-button';
import { useUserColumns } from '@/components/user-table-columns';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/shops/$shopId/_layout/users')({
  beforeLoad: () => ({ title: "Users" }),
  component: ShopUsersComponent,
})

function ShopUsersComponent() {
  const { shopId } = Route.useParams();
  const { user } = Route.useRouteContext();

  const { data: shop } = useSuspenseQuery(getShopForIdQueryOptions(shopId))
  const userCols = useUserColumns(shopId)

  return user.id === shop.owner_id ? <Card className='sm:max-w-full'>
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
  </Card> :
    <h2>Error 403: Forbidden</h2>
}
