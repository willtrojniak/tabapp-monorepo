import { getShopItemsQueryOptions } from '@/api/items';
import { getShopSubstitutionsQueryOptions, useDeleteSubstitutionGroup } from '@/api/substitutions';
import { useOnErrorToast, useOnSuccessToast } from '@/api/toasts';
import { CategoryTabSelect } from '@/components/category-items';
import { DialogDeleteForm } from '@/components/forms/dialog-delete-form';
import { SubstitutionGroupFormDialog, useSubstitutionGroupForm } from '@/components/forms/substitution-group-form'
import { SortableInput } from '@/components/sortable-input';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateButton } from '@/components/ui/create-button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EditButton } from '@/components/ui/edit-button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { ReactSelect } from '@/components/ui/react-select';
import { ItemOverview } from '@/types/types';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Menu, Save, Trash2, X } from 'lucide-react';
import React from 'react';
import { z } from 'zod'

export const Route = createFileRoute('/_auth/shops/$shopId/_shopuser/items/substitutions/')({
  validateSearch: z.object({
    substitution: z.number().optional()
  }),
  component: Page,
})

function Page() {
  const navigate = useNavigate();

  const { shopId } = Route.useParams();
  const { substitution: groupId } = Route.useSearch();
  const { data: substitutions } = useSuspenseQuery(getShopSubstitutionsQueryOptions(shopId))
  const { data: items } = useSuspenseQuery(getShopItemsQueryOptions(shopId))

  const selectedGroup = React.useMemo(() => {
    if (!groupId) return substitutions[0];
    return substitutions.find(c => c.id === groupId)
  }, [groupId, substitutions])

  const onGroupChange = React.useCallback((id: string) => {
    navigate({ search: { substitution: Number(id) ?? undefined }, replace: true })
  }, [navigate])

  const { form, onSubmit } = useSubstitutionGroupForm({ shopId, group: selectedGroup, })
  const onError = useOnErrorToast()
  const onSuccess = useOnSuccessToast()
  const deleteGroup = useDeleteSubstitutionGroup();

  const [editing, setEditing] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  return <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} autoComplete='off' className='flex flex-grow'>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle>Substitution Groups</CardTitle>
            <CardDescription>Manage item group alternatives</CardDescription>
            <CardAction className='flex gap-1'>
              {editing &&
                <FormField
                  control={form.control}
                  name="substitution_item_ids"
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
              {!editing && <EditButton disabled={!selectedGroup} onClick={() => setEditing(true)}> Edit Group</EditButton>}
              {!editing &&
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled={!selectedGroup} >
                    <Button variant='ghost' type='button'><Menu className='size-4' /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>Group Options</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
                        <span>Rename '{selectedGroup?.name}'</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-destructive' onSelect={() => setDeleteOpen(true)}>
                        Delete Group
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              }

              {!editing && <CreateButton disabled={editing} onClick={() => setCreateOpen(true)} type='button'>Create Group</CreateButton>}
            </CardAction>
          </CardHeader>
          <CardContent>
            <CategoryTabSelect categories={substitutions} value={groupId?.toString() ?? selectedGroup?.id.toString() ?? ""} onValueChange={onGroupChange} disabled={editing} allowNone={false} />
          </CardContent>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {selectedGroup ?
                <FormField
                  control={form.control}
                  name="substitution_item_ids"
                  render={({ field }) => (
                    <SortableInput
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!editing}
                      render={(item) => (
                        <Button key={item.id} variant="secondary" className='w-32' type='button'>{item.name}</Button>
                      )}
                      trashComponent={<div className='flex-1 basis-1 w-full min-h-32  outline-dashed outline-destructive flex items-center justify-center text-destructive'><div><Trash2 className='m-auto stroke-destructive w-6 h-6' />Remove from Group</div></div>}
                    />
                  )}
                />
                :
                <div className='text-muted-foreground'>
                  Select or create a substitution group to get started
                </div>
              }
            </div>
          </CardContent>
        </Card >
      </form>
    </Form >
    <SubstitutionGroupFormDialog shopId={shopId} open={createOpen} onOpenChange={setCreateOpen} />
    <SubstitutionGroupFormDialog shopId={shopId} group={selectedGroup} open={renameOpen} onOpenChange={setRenameOpen} />
    <DialogDeleteForm
      open={deleteOpen}
      onOpenChange={setDeleteOpen}
      title="Delete Group?"
      onDelete={async () => {
        deleteGroup.mutate({ shopId, groupId: selectedGroup!.id }, {
          onError,
          onSuccess: () => {
            onSuccess("Successfully deleted group.")
            setEditing(false)
          }
        })
      }} />
  </>
}
