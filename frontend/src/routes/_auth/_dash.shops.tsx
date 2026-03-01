import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_dash/shops')({
  beforeLoad: () => ({ title: "Shops" }),
})
