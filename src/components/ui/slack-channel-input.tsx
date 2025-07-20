import React, { Suspense } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSuspenseQuery } from "@tanstack/react-query";
import { getShopSlackChannelsForIdQueryOptions } from "@/api/shops";
import { Lock, X } from 'lucide-react';
import { Button } from "./button";
import { ErrorBoundary } from 'react-error-boundary';


export const SlackChannelInput = React.forwardRef<React.ElementRef<typeof Select>, Omit<React.ComponentPropsWithoutRef<typeof Select> & { shopId: number }, "children">>(({ shopId, ...props }, ref) => {
  return <div className="flex gap-1 items-center">
    <Select {...props}>
      <SelectTrigger className="max-w-[240px]">
        <SelectValue ref={ref} placeholder="Disabled" />
      </SelectTrigger>
      <SelectContent>
        <ErrorBoundary fallback={<SelectGroup><SelectLabel>Failed to load</SelectLabel></SelectGroup>}>
          <Suspense fallback={<SelectGroup><SelectLabel>Loading...</SelectLabel></SelectGroup>}>
            <SlackChannelOptions shopId={shopId} />
          </Suspense>
        </ErrorBoundary>
      </SelectContent >
    </Select>
    {!!props.value &&
      <Button
        className='w-fit h-fit p-1 flex-grow-0'
        variant='ghost'
        type="button"
        onClick={() => props.onValueChange?.("")}>
        <X className='size-4' />
      </Button>
    }
  </div>
})

function SlackChannelOptions({ shopId }: {
  shopId: number
}) {
  const { data: channels } = useSuspenseQuery(getShopSlackChannelsForIdQueryOptions(shopId))
  return <> <SelectGroup>
    <SelectLabel>Public Channels</SelectLabel>
    {channels.filter(c => !c.is_private).map(c => <SelectItem key={c.name} value={c.name}># {c.name}</SelectItem>)}
  </SelectGroup>
    <SelectGroup>
      <SelectLabel>Private Channels</SelectLabel>
      {channels.filter(c => c.is_private).map(c => <SelectItem key={c.name} value={c.name}><Lock className='size-3 inline align-baseline mr-1' /> {c.name}</SelectItem>)}
    </SelectGroup>
  </>
}
