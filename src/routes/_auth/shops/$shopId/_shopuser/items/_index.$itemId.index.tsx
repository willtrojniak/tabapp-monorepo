import { createFileRoute } from '@tanstack/react-router'
import { getShopItemForIdQueryOptions, getShopItemsQueryOptions } from '@/api/items'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { useItemVariantColumns } from '@/components/item-variants-table-columns'
import { ItemVariantFormDialog } from '@/components/forms/item-variant-from'
import { Plus } from 'lucide-react'
import { getShopCategoriesQueryOptions } from '@/api/categories'
import { ItemFormCard } from '@/components/forms/item-form'
import { getShopSubstitutionsQueryOptions } from '@/api/substitutions'
import { authorizeShopAction, ShopAction } from '@/util/authorization'
import { getShopForIdQueryOptions } from '@/api/shops'
import { OrderFormCard } from '@/components/forms/order-form'

export const Route = createFileRoute('/_auth/shops/$shopId/_shopuser/items/_index/$itemId/')({
  component: ItemComponent
})

function ItemComponent() {
  const { user } = Route.useRouteContext();
  const { shopId, itemId } = Route.useParams();
  const { data: shop } = useSuspenseQuery(getShopForIdQueryOptions(shopId))
  const { data: categories } = useSuspenseQuery(getShopCategoriesQueryOptions(shopId))
  const { data: items } = useSuspenseQuery(getShopItemsQueryOptions(shopId))
  const { data: item } = useSuspenseQuery(getShopItemForIdQueryOptions(shopId, itemId))
  const { data: substitutions } = useSuspenseQuery(getShopSubstitutionsQueryOptions(shopId))

  const variantCols = useItemVariantColumns(shopId, itemId);

  return <div className='flex-grow flex flex-wrap gap-2'>
    <ItemFormCard shopId={shopId} item={item} categories={categories} addons={items} substitutions={substitutions} disabled={!authorizeShopAction(user, shop, ShopAction.UPDATE_ITEM)} />
    <Card className='min-w-72 flex-grow basis-0'>
      <CardHeader>
        <CardTitle className='w-24'>Edit Variants</CardTitle>
        <CardDescription>Item sizes, etc</CardDescription>
        <CardAction>
          {authorizeShopAction(user, shop, ShopAction.CREATE_VARIANT) &&
            <ItemVariantFormDialog shopId={shopId} itemId={itemId}>
              <Button variant="ghost"><Plus className='w-4 h-4 mr-2' /> Create Variant</Button>
            </ItemVariantFormDialog>}
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col max-h-96'>
        <DataTable columns={variantCols} data={item.variants} />
      </CardContent>
    </Card>
    <OrderFormCard shopId={shopId} tabId={0} item={item} disabled />
  </div>

}
