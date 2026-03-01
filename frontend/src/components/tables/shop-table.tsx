import { ShopOverview } from "@/types/types";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";
import { ColumnDef, FilterFn, flexRender, getCoreRowModel, getFilteredRowModel, SortingFn, sortingFns, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const fuzzyFilterShop: FilterFn<ShopOverview> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({
    itemRank
  })
  return itemRank.passed
}

const fuzzySortShop: SortingFn<ShopOverview> = (rowA, rowB, columnId) => {
  let dir = 0;
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]?.itemRank!,
      rowB.columnFiltersMeta[columnId]?.itemRank!
    )
  }

  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir

}

export function ShopTable({ shops, columns }: {
  shops: ShopOverview[],
  columns: ColumnDef<ShopOverview>[]
}) {

  const table = useReactTable<ShopOverview>({
    data: shops,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      fuzzy: fuzzyFilterShop
    },
    sortingFns: {
      fuzzy: fuzzySortShop
    },
    initialState: {
      columnVisibility: {
        id: false,
      }
    },
  })

  return <div className="max-h-full overflow-y-auto rounded-md border">
    <Table>
      <TableHeader className="whitespace-nowrap">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} >
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {!header.isPlaceholder &&
                  flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} >
              {
                row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))
              }
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
}
