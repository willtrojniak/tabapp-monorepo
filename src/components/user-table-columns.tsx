import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { DialogDeleteForm } from "./forms/dialog-delete-form";
import { ShopUser } from '@/types/types'
import { useOnErrorToast } from "@/api/toasts";
import { EditButton } from "./ui/edit-button";
import { useRemoveShopInvite } from "@/api/shops";
import { ShopUserFormDialog } from "./forms/shop-user-form";
import { Crown, Send, UserRoundCheck } from "lucide-react";

export function useUserColumns(shopId: number): ColumnDef<ShopUser>[] {
  const onError = useOnErrorToast();
  const deleteInvite = useRemoveShopInvite()
  const onDelete = React.useCallback(async ({ shopId, email }: { shopId: number, email: string }) => {
    await deleteInvite.mutateAsync({ shopId, data: { email, roles: 1 } }, {
      onError,
    })
  }, [shopId])

  return React.useMemo(() => {
    return [
      {
        id: 'id',
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "confirmed",
        header: "Status",
        cell: ({ row }) => {
          const user = row.original
          return <div className="flex flex-wrap gap-2">
            {!user.confirmed ? <><Send className="size-4" />Invite Pending </> : user.is_owner ? <><Crown className="size-4" /> Owner</> : <><UserRoundCheck className="size-4" />Confirmed User</>}
          </div>

        }
      },
      {
        id: 'edit',
        cell: ({ row }) => {
          const user = row.original
          return user.is_owner ? "" : <ShopUserFormDialog shopId={shopId} user={user} >
            <EditButton variant="ghost" />
          </ShopUserFormDialog>
        }
      },
      {
        id: 'delete',
        cell: ({ row }) => {
          const user = row.original
          return user.is_owner ? "" : < DialogDeleteForm title="Remove User" onDelete={() => onDelete({ shopId, email: user.email })
          } />
        }
      },
    ]
  }, [shopId, onDelete])

}
