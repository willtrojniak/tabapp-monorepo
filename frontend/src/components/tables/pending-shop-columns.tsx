import { ShopOverview, User } from "@/types/types"
import { ColumnDef } from "@tanstack/react-table"
import { useAcceptShopInvite, useRemoveShopInvite } from '@/api/shops';
import React from "react"
import { Button } from "../ui/button";
import { Check, X } from "lucide-react";

export function useShopPendingColumns({ user }: {
  user: User
}): ColumnDef<ShopOverview>[] {
  const acceptInvite = useAcceptShopInvite()
  const rejectInvite = useRemoveShopInvite()

  return React.useMemo(() => [
    {
      accessorKey: "id",
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const shop = row.original
        return <div className="whitespace-nowrap">{shop.name}</div>
      },
      sortingFn: 'fuzzy',
    },
    {
      id: "accept",
      cell: ({ row }) => {
        const shop = row.original
        return <Button className='gap-2' onClick={() => acceptInvite.mutate({ shopId: shop.id })}><Check className='w-4 h-4' /></Button>
      }

    },
    {
      id: "deny",
      cell: ({ row }) => {
        const shop = row.original
        return <Button className='gap-2' variant='destructive' onClick={() => rejectInvite.mutate({ shopId: shop.id, data: { roles: 1, email: user.email } })}><X className='w-4 h-4' /></Button>
      }

    }
  ] satisfies ColumnDef<ShopOverview>[], [user])
}
