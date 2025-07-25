import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashLayout')({
  beforeLoad: async ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: '/dash',
        replace: true,
        mask: {
          to: '/',
        }
      })
    }

    return {
      user: context.auth.user!,
    }
  }
})
