import { ShopOverview } from "@/types/types"
import { Link } from "@tanstack/react-router"
import { ColumnDef } from "@tanstack/react-table"
import React from "react"
import { Button } from "../ui/button"
import { ExternalLink } from "lucide-react"

export function useShopColumns(): ColumnDef<ShopOverview>[] {
  return React.useMemo(() => [
    {
      accessorKey: "id",
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const shop = row.original
        return <Link to={"/shops/$shopId"} params={{ shopId: shop.id }}>
          <Button className='gap-2' variant='link'>
            {shop.name} <ExternalLink className='size-4' />
          </Button>
        </Link>
      },
      sortingFn: 'fuzzy',
    },
  ] satisfies ColumnDef<ShopOverview>[], [])
}
