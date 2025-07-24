import { useDeleteCategory, useGetShopCategories } from '@/api/categories';
import { getShopItemsQueryOptions } from '@/api/items';
import { useOnErrorToast, useOnSuccessToast } from '@/api/toasts';
import { CategoryTabSelect } from '@/components/category-items'
import { CategoryFormDialog, useCategoryForm } from '@/components/forms/category-form';
import { DialogDeleteForm } from '@/components/forms/dialog-delete-form';
import { SortableInput } from '@/components/sortable-input';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateButton } from '@/components/ui/create-button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EditButton } from '@/components/ui/edit-button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { ReactSelect } from '@/components/ui/react-select';
import { ItemOverview } from '@/types/types';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router'
import { Menu, Save, Trash2, X } from 'lucide-react';
import React from 'react';
import { z } from 'zod';

export const Route = createFileRoute('/_auth/shops/$shopId/_shopuser/categories/')({
  validateSearch: z.object({
    category: z.number().optional()
  }),
  component: Page,
})

function Page() {
  const { shopId } = Route.useParams();
  const categories = useGetShopCategories(shopId);
  const { category: categoryId } = Route.useSearch()
  const selectedCategory = React.useMemo(() => {
    return categories.find(c => c.id === categoryId)
  }, [categoryId, categories])

  const { data: items } = useSuspenseQuery(getShopItemsQueryOptions(shopId))

  const navigate = Route.useNavigate();
  const [editing, setEditing] = React.useState(false);

  const onCategoryChange = React.useCallback((id: string) => {
    navigate({ search: id ? { category: Number(id) } : {}, replace: true })
  }, [navigate])

  const { form, onSubmit } = useCategoryForm({ shopId, category: selectedCategory, index: selectedCategory?.index })
  const deleteCategory = useDeleteCategory()
  const onError = useOnErrorToast()
  const onSuccess = useOnSuccessToast()

  const [createOpen, setCreateOpen] = React.useState(false);
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  return <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} autoComplete='off' className='flex min-h-full'>
        <Card className='min-h-full w-full'>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Organize items within categories.</CardDescription>
            <CardAction className='flex gap-1'>
              {editing &&
                <FormField
                  control={form.control}
                  name="item_ids"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ReactSelect
                          {...field}
                          isMulti
                          options={items}
                          getOptionValue={(i) => { const item = i as ItemOverview; return item.id.toString() }}
                          getOptionLabel={(i) => { const item = i as ItemOverview; return item.name }}
                          controlShouldRenderValue={false}
                          placeholder="+ Add Item"
                          isClearable={false}
                          backspaceRemovesValue={false}
                          className='min-w-48'
                        />
                      </FormControl>
                    </FormItem>
                  )} />
              }
              {editing && <Button className='gap-2' type='reset' variant='outline' onClick={() => { form.reset(); setEditing(false) }}><X className='w-4 h-4' />Discard Changes</Button>}
              {editing && <Button type='submit'><Save className='size-4 mr-2' />Save</Button>}
              {!editing && <EditButton disabled={!selectedCategory} onClick={() => setEditing(true)}> Edit Layout</EditButton>}
              {!editing &&
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={!selectedCategory} >
                    <Button variant='ghost' type='button'><Menu className='size-4' /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>Category Options</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
                        <span>Rename '{selectedCategory?.name}'</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-destructive' onSelect={() => setDeleteOpen(true)}>
                        Delete Category
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              }

              {!editing && <CreateButton disabled={editing} onClick={() => setCreateOpen(true)} type='button'>Create Category</CreateButton>}
            </CardAction>
          </CardHeader>
          <CardContent>
            <CategoryTabSelect categories={categories} value={categoryId?.toString() ?? ""} onValueChange={onCategoryChange} disabled={editing} />
          </CardContent>
          <CardContent>
            <div className='grid  grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2'>
              {selectedCategory ?
                <FormField
                  control={form.control}
                  name="item_ids"
                  render={({ field }) => (
                    <SortableInput
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!editing}
                      render={(item) => (
                        <Button key={item.id} variant="secondary" className='min-w-32 w-full' type='button'>{item.name}</Button>
                      )}
                      trashComponent={<div className='min-h-32 h-full col-span-full outline-dashed outline-destructive flex items-center justify-center text-destructive'><div><Trash2 className='m-auto stroke-destructive w-6 h-6' />Remove from category</div></div>}
                    />
                  )}
                />
                :
                items.map(item => (
                  <Button key={item.id} variant="secondary" className='min-w-32 w-full' type='button'>{item.name}</Button>
                ))}
            </div>
          </CardContent>
        </Card >
      </form>
    </Form >
    <CategoryFormDialog shopId={shopId} open={createOpen} onOpenChange={setCreateOpen} />
    <CategoryFormDialog shopId={shopId} category={selectedCategory} open={renameOpen} onOpenChange={setRenameOpen} />
    <DialogDeleteForm
      open={deleteOpen}
      onOpenChange={setDeleteOpen}
      title="Delete Category?"
      onDelete={async () => {
        deleteCategory.mutate({ shopId, categoryId: selectedCategory!.id }, {
          onError,
          onSuccess: () => {
            onSuccess("Successfully deleted category.")
            setEditing(false)
          }
        })
      }} />
  </>
}
