import { useUpdateShopSlackChannels } from "@/api/shops";
import { useOnErrorToast, useOnSuccessToast } from "@/api/toasts";
import { SlackChannels, SlackChannelsInput, slackChannelsUpdateSchema } from "@/types/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { SlackChannelInput } from "../ui/slack-channel-input";

export function useShopSlackChannelsForm({ shopId, channels }: {
  shopId: number,
  channels: SlackChannels,
}) {
  const form = useForm<SlackChannelsInput>({
    resolver: zodResolver(slackChannelsUpdateSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: channels
  })

  const onSuccess = useOnSuccessToast();
  const onError = useOnErrorToast();

  const updateChannels = useUpdateShopSlackChannels();

  const onSubmit = React.useCallback((async (v: unknown) => {
    const values = v as SlackChannelsInput;
    updateChannels.mutate({ shopId, data: values }, {
      onSuccess: () => onSuccess("Successfully updated channel"),
      onError,
    })
  }), [shopId])

  React.useEffect(() => {
    form.reset(channels)
  }, [channels])

  return { form, onSubmit }
}

export function ShopSlackChannelsForm({ shopId, channels }: {
  shopId: number,
  channels: SlackChannels,
}) {
  const { form, onSubmit } = useShopSlackChannelsForm({ shopId, channels })
  const { handleSubmit, watch } = form;
  React.useEffect(() => {
    const sub = watch(() => handleSubmit(onSubmit)())
    return () => sub.unsubscribe()
  }, [handleSubmit, watch])

  return <Form {...form}>
    <form autoComplete="off" onSubmit={form.handleSubmit(onSubmit)} className="w-[480px]">
      <FormField
        control={form.control}
        name="daily_update_slack_channel"
        rules={{}}
        render={({ field }) => (
          <FormItem className="grid grid-cols-2 gap-2 items-center">
            <FormLabel>Daily Overview</FormLabel>
            <FormControl>
              <SlackChannelInput shopId={shopId} onValueChange={field.onChange} {...field} />
            </FormControl>
          </FormItem>
        )} />
      <FormField
        control={form.control}
        name="tab_request_slack_channel"
        rules={{}}
        render={({ field }) => (
          <FormItem className="grid grid-cols-2 gap-2 items-center">
            <FormLabel>Tab Requests</FormLabel>
            <FormControl>
              <SlackChannelInput shopId={shopId} onValueChange={field.onChange} {...field} />
            </FormControl>
          </FormItem>
        )} />
      <FormField
        control={form.control}
        name="tab_bill_receipt_slack_channel"
        rules={{}}
        render={({ field }) => (
          <FormItem className="grid grid-cols-2 gap-2 items-center">
            <FormLabel>Tab Bill Receipts</FormLabel>
            <FormControl>
              <SlackChannelInput shopId={shopId} onValueChange={field.onChange} {...field} />
            </FormControl>
          </FormItem>
        )} />
    </form>
  </Form>
}
