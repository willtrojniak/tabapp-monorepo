import { createFileRoute } from '@tanstack/react-router'
import { TabDialog } from '@/components/tab-dialog-content';


export const Route = createFileRoute('/_auth/shops/$shopId/_shopuser/tabs/$tabId/')({
  component: TabComponent
})

function TabComponent() {
  const { shopId, tabId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const navigate = Route.useNavigate()

  return <TabDialog open onOpenChange={() => {
    navigate(({ to: '/shops/$shopId/tabs', params: { shopId }, replace: false }))
  }}
    user={user} shopId={shopId} tabId={tabId}
  />
}

