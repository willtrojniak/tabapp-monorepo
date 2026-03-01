import { getShopForIdQueryOptions } from '@/api/shops'
import { getShopTabsQueryOptions } from '@/api/tabs'
import { TabFormSheet } from '@/components/forms/tab-form'
import { useTabColumns } from '@/components/tables/tab-columns'
import { CreateButton } from '@/components/ui/create-button'
import { hasShopRole, shopRoles } from '@/util/authorization'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabTable } from '@/components/tables/tab-table'

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

  return <>
    {hasShopRole(user, shop, shopRoles.MANAGE_ORDERS) &&
      <Card className='max-w-full'>
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
          <CardDescription>Search through and manage tabs.</CardDescription>
          {hasShopRole(user, shop, shopRoles.MANAGE_TABS) &&
            <CardAction>
              <TabFormSheet shop={shop}>
                <CreateButton>Create Tab</CreateButton>
              </TabFormSheet>
            </CardAction>
          }
        </CardHeader>
        <CardContent>
          <TabTable tabs={tabs} columns={columns} uri={'/shops/$shopId/tabs/$tabId'} />
        </CardContent>
      </Card >
    }
    <Outlet />
  </>

}
