import { Category } from "@/types/types";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export function CategoryTabSelect({ categories, value, onValueChange, disabled = false, allowNone = true }: {
  allowNone?: boolean
  value: string,
  disabled?: boolean,
  onValueChange: (id: string) => void
  categories: Category[]
}) {

  if (!allowNone && categories.length === 0) return <div>No Categories</div>

  return <Tabs value={value} onValueChange={onValueChange} className="max-w-full overflow-x-scroll pr-2">
    <TabsList>
      {allowNone && <TabsTrigger key={''} value={''} disabled={disabled}>All</TabsTrigger>}
      {categories.map(c => <TabsTrigger key={c.id} value={`${c.id}`} disabled={disabled}>{c.name}</TabsTrigger>)}
    </TabsList>
  </Tabs >
}
