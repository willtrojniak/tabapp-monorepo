import { TabOverview } from "@/types/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { TabTable } from "./tables/tab-table"
import { ColumnDef } from "@tanstack/react-table"

type PropsType = Omit<React.ComponentPropsWithoutRef<typeof Card>, "children"> & {
  tabs: TabOverview[],
  columns: ColumnDef<TabOverview>[]
  uri: string,
}

export function TabsTableCard({ tabs, columns, uri, ...props }: PropsType) {

  return <Card {...props}>
    <CardHeader>
      <CardTitle>Tabs</CardTitle>
      <CardDescription>Search through and manage tabs.</CardDescription>
    </CardHeader>
    <CardContent>
      <TabTable tabs={tabs} columns={columns} uri={uri} />
    </CardContent>
  </Card >
}
