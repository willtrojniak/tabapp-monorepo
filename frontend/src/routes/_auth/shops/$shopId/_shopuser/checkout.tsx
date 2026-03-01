import { useGetShopCategories } from '@/api/categories';
import { getShopForIdQueryOptions } from '@/api/shops';
import { getShopTabsQueryOptions } from '@/api/tabs';
import { CategoryTabSelect } from '@/components/category-items';
import { TabDialog } from '@/components/tab-dialog-content';
import { TabCheckoutTable } from '@/components/tables/tab-checkout-table';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { TabOverview } from '@/types/types';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import React, { Suspense } from 'react';
import { z } from 'zod';

export const Route = createFileRoute('/_auth/shops/$shopId/_shopuser/checkout')({
  validateSearch: z.object({
    category: z.number().optional(),
    tab: z.number().optional(),
    modal: z.boolean().optional().default(false),
  }),
  beforeLoad: () => {
    return { title: "Checkout" }
  },
  component: CheckoutComponent,
  errorComponent: v => { return v.error.message }
})

function CheckoutComponent() {
  const navigate = Route.useNavigate();
  const { user } = Route.useRouteContext();

  const { shopId } = Route.useParams();
  const { category: categoryId, tab: tabId, modal } = Route.useSearch()

  const categories = useGetShopCategories(shopId);
  const { data: shop } = useSuspenseQuery(getShopForIdQueryOptions(shopId))
  const { data: tabs } = useSuspenseQuery(getShopTabsQueryOptions(shopId))

  const selectedCategory = React.useMemo(() => {
    if (!categoryId) return categories[0];
    return categories.find(c => c.id === categoryId)
  }, [categories, categoryId])

  const onCategoryChange = React.useCallback((id: string) => {
    navigate({
      search: prev => ({ ...prev, category: id ? Number(id) : undefined }),
      replace: true
    })
  }, [navigate])

  const selectedTab = React.useMemo(() => {
    return tabs.find(t => t.id === tabId)
  }, [tabs, tabId])

  const onTabChange = React.useCallback((tab: TabOverview) => {
    navigate({
      search: prev => ({ ...prev, tab: tab.id }),
      replace: true
    })
  }, [navigate])

  return <><ResizablePanelGroup direction='horizontal' >
    <ResizablePanel defaultSize={33} className='@container'>
      <div className='flex flex-col gap-2 items-start'>
        <CategoryTabSelect value={categoryId?.toString() ?? selectedCategory?.id.toString() ?? ""} onValueChange={onCategoryChange} categories={categories} allowNone={false} />

        <div className='grid pr-2 grid-cols-2 @md:grid-cols-3 @xl:grid-cols-4 @3xl:grid-cols-5 @4xl:grid-cols-6 gap-2'>
          {selectedCategory?.items.map(i => (
            <Link
              key={i.id}
              disabled={!selectedTab}
              to='/shops/$shopId/checkout/$itemId'
              params={{ shopId, itemId: i.id }}
              search={{ tab: selectedTab?.id!, category: categoryId, modal: false }}
              // mask={{ to: '/shops/$shopId/checkout', params: { shopId }, unmaskOnReload: true }}
              replace={true}
            >
              <Button disabled={!selectedTab} className='block w-fit min-w-full max-w-full overflow-ellipsis overflow-hidden' variant="secondary">{i.name}</Button>
            </Link>
          ))}
          {selectedCategory?.items.length === 0 && <div className='text-muted-foreground text-sm whitespace-nowrap'>No items to display</div>}
          {!selectedCategory && <div className='text-muted-foreground text-sm whitespace-nowrap'>No category selected</div>}
        </div>
      </div>
    </ResizablePanel>
    <ResizableHandle />
    <ResizablePanel defaultSize={67} className='py-2' >
      <Suspense fallback={"Loading"}>
        <div className='flex flex-col items-start pl-6'>
          <TabCheckoutTable shop={shop} data={tabs} selectedTab={selectedTab} setSelectedTab={onTabChange} />
          <Outlet />
        </div>
      </Suspense>
    </ResizablePanel>
  </ResizablePanelGroup >
    {tabId &&
      <TabDialog open={modal} onOpenChange={open => navigate({ search: prev => ({ ...prev, modal: open }), replace: true })} user={user} shopId={shopId} tabId={tabId} />
    }
  </>
}
