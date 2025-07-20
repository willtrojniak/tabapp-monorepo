import { getUserTabsQueryOptions } from '@/api/tabs'
import { TabDialogContent } from '@/components/tab-dialog-content'
import { useUserTabColumns } from '@/components/tables/user-tab-columns'
import { TabsTableCard } from '@/components/tabs-table-card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_auth/tabs')({
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

  return <div className='p-4'>
    <TabsTableCard tabs={tabs} columns={columns} uri='/tabs'>
    </TabsTableCard>
    {!!shopId && !!tabId && <Dialog open onOpenChange={() => navigate({ search: {} })}>
      <TabDialogContent user={user} shopId={shopId!} tabId={tabId!} />
    </Dialog>}
  </div>
}
