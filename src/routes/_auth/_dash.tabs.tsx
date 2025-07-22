import { getUserTabsQueryOptions } from '@/api/tabs'
import { TabDialogContent } from '@/components/tab-dialog-content'
import { useUserTabColumns } from '@/components/tables/user-tab-columns'
import { Dialog } from '@/components/ui/dialog'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabTable } from '@/components/tables/tab-table'

export const Route = createFileRoute('/_auth/_dash/tabs')({
  validateSearch: z.object({
    shopId: z.number().optional(),
    tabId: z.number().optional(),
  }),
  beforeLoad: () => ({ title: "Tabs" }),
  component: TabsComponent
})

function TabsComponent() {
  const { user } = Route.useRouteContext()
  const { shopId, tabId } = Route.useSearch()
  const { data: tabs } = useSuspenseQuery(getUserTabsQueryOptions())
  const columns = useUserTabColumns()
  const navigate = useNavigate()

  return <div>
    <Card className='max-w-full'>
      <CardHeader>
        <CardTitle>Tabs</CardTitle>
        <CardDescription>Search through and manage the tabs you've requested.</CardDescription>
      </CardHeader>
      <CardContent>
        <TabTable tabs={tabs} columns={columns} uri={'/tabs'} />
      </CardContent>
    </Card >
    {!!shopId && !!tabId && <Dialog open onOpenChange={() => navigate({ search: {} })}>
      <TabDialogContent user={user} shopId={shopId!} tabId={tabId!} />
    </Dialog>}
  </div>
}
