import { createFileRoute } from '@tanstack/react-router'
import { ShopFormDialog } from '@/components/forms/shop-form';
import { PaymentMethod } from '@/types/types';
import { CreateButton } from '@/components/ui/create-button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ensureShops, getShopsQueryOptions } from '@/api/shops';
import { ShopTable } from '@/components/tables/shop-table';
import { useShopColumns } from '@/components/tables/shop-columns';
import { useShopPendingColumns } from '@/components/tables/pending-shop-columns';
import { useSuspenseQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/_dash/shops/')({
  component: ShopsComponent,
  loader: async ({ context }) => {
    const memberShops = await ensureShops(context.queryClient, { isMember: true, isPending: null });
    const pendingShops = await ensureShops(context.queryClient, { isMember: null, isPending: true });
    return { memberShops, pendingShops }
  },
})

function ShopsComponent() {
  const { user } = Route.useRouteContext();
  const { data: memberShops } = useSuspenseQuery(getShopsQueryOptions({ isMember: true, isPending: null }))
  const { data: pendingShops } = useSuspenseQuery(getShopsQueryOptions({ isMember: null, isPending: true }))
  const shopCols = useShopColumns();
  const shopPendingCols = useShopPendingColumns({ user });

  return <div className='flex flex-row flex-wrap gap-2'>
    <Card className='w-96 max-w-full'>
      <CardHeader>
        <CardTitle>Shops</CardTitle>
        {memberShops.length === 0 && <CardAction>
          <ShopFormDialog paymentMethods={[PaymentMethod.in_person, PaymentMethod.chartstring]}>
            <CreateButton>Create Shop</CreateButton>
          </ShopFormDialog>
        </CardAction>}
      </CardHeader>
      <CardContent>
        <ShopTable shops={memberShops} columns={shopCols} />
      </CardContent>
    </Card>
    <Card className='w-96 max-w-full'>
      <CardHeader>
        <CardTitle>Invites</CardTitle>
      </CardHeader>
      <CardContent>
        <ShopTable shops={pendingShops} columns={shopPendingCols} />
      </CardContent>
    </Card>
  </div>
}
