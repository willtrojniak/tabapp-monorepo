import { getShopForIdQueryOptions } from '@/api/shops'
import { getShopTabsQueryOptions } from '@/api/tabs'
import { TabFormSheet } from '@/components/forms/tab-form'
import { useTabColumns } from '@/components/tables/tab-columns'
import { TabsTableCard } from '@/components/tabs-table-card'
import { CreateButton } from '@/components/ui/create-button'
import { hasShopRole, shopRoles } from '@/util/authorization'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/shops/$shopId/_shopuser/tabs')({
  beforeLoad: () => ({ title: "Tabs" }),
  component: TabComponent
})

function TabComponent() {
  const { shopId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const { data: shop } = useSuspenseQuery(getShopForIdQueryOptions(shopId))
  const { data: tabs } = useSuspenseQuery(getShopTabsQueryOptions(shopId))
  const columns = useTabColumns()

  return <div className='flex flex-col items-start gap-4'>
    <TabFormSheet shop={shop}>
      <CreateButton>Create Tab</CreateButton>
    </TabFormSheet>
    {hasShopRole(user, shop, shopRoles.MANAGE_TABS) &&
      <TabsTableCard tabs={tabs} columns={columns} className='max-w-full' uri='/shops/$shopId/tabs/$tabId' />
    }
    <Outlet />
  </div>

}
