import { createFileRoute } from '@tanstack/react-router'
import { ensureShops, getShopsQueryOptions } from '@/api/shops';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ensureUserTabs, getUserTabsQueryOptions } from '@/api/tabs';
import { useSuspenseQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/_auth/_dash/dash')({
  loader: ({ context }) => {
    return Promise.all([
      ensureShops(context.queryClient, { isMember: true, isPending: null }),
      ensureShops(context.queryClient, { isMember: false, isPending: true }),
      ensureUserTabs(context.queryClient)
    ]);
  },
  component: Page

})

function Page() {
  const { data: shops } = useSuspenseQuery(getShopsQueryOptions({ isMember: true, isPending: null }))
  const { data: invites } = useSuspenseQuery(getShopsQueryOptions({ isMember: null, isPending: true }))
  const { data: tabs } = useSuspenseQuery(getUserTabsQueryOptions())

  return <div className='flex gap-2'>
    <Card>
      <CardContent>
        <CardDescription>Tabs</CardDescription>
        <CardTitle>{tabs.length}</CardTitle>
      </CardContent>
    </Card>
    <Card>
      <CardContent>
        <CardDescription>Shops</CardDescription>
        <CardTitle>{shops.length}</CardTitle>
      </CardContent>
    </Card>
    <Card>
      <CardContent>
        <CardDescription>Pending Invites</CardDescription>
        <CardTitle>{invites.length}</CardTitle>
      </CardContent>
    </Card>
  </div>
}
