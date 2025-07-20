import { createFileRoute } from '@tanstack/react-router'
import { Dialog } from '@/components/ui/dialog';
import { TabDialogContent } from '@/components/tab-dialog-content';


export const Route = createFileRoute('/_auth/shops/$shopId/_shopuser/tabs/$tabId/')({
  component: TabComponent
})

function TabComponent() {
  const { shopId, tabId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const navigate = Route.useNavigate()

  return <Dialog open onOpenChange={() => {
    navigate(({ to: '/shops/$shopId/tabs', params: { shopId }, replace: false }))
  }}>
    <TabDialogContent user={user} shopId={shopId} tabId={tabId} />
  </Dialog >;
}

