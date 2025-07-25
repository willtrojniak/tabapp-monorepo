import { useGetShopCategories } from "@/api/categories";
import { getShopItemsQueryOptions } from "@/api/items";
import { getShopSubstitutionsQueryOptions } from "@/api/substitutions";
import { DataTable } from "@/components/data-table";
import { ItemFormDialog } from "@/components/forms/item-form";
import { useItemColumns } from "@/components/item-table-columns";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateButton } from "@/components/ui/create-button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute('/_auth/shops/$shopId/_shopuser/items/_index')({
  component: Page
})

function Page() {
  const { shopId, itemId } = { itemId: 0, ...Route.useParams() };
  const { data: items } = useSuspenseQuery(getShopItemsQueryOptions(shopId))
  const { data: substitutions } = useSuspenseQuery(getShopSubstitutionsQueryOptions(shopId))
  const categories = useGetShopCategories(shopId);
  const itemCols = useItemColumns(shopId)

  return <div className='flex flex-wrap items-stretch gap-2'>
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Items</CardTitle>
        <CardDescription>Manage items available</CardDescription>
        <CardAction>
          <ItemFormDialog shopId={shopId} categories={categories} substitutions={substitutions} addons={items}>
            <CreateButton>Create Item</CreateButton>
          </ItemFormDialog>
        </CardAction>
      </CardHeader>
      <CardContent className="max-h-[30vh]">
        <DataTable data={items} columns={itemCols} selectedId={itemId} />
      </CardContent>
    </Card>
    <Outlet />
  </div>
}
