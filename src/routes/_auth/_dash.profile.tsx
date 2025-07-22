import { UserFormCard } from '@/components/forms/user-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth';
import { createFileRoute } from '@tanstack/react-router'
import { LogOut } from 'lucide-react';

export const Route = createFileRoute('/_auth/_dash/profile')({
  beforeLoad: () => {
    return { title: "Profile" }
  },
  component: ProfileComponent
})

function ProfileComponent() {
  const { user } = Route.useRouteContext();
  const auth = useAuth();

  return <div className='flex items-start gap-2'>
    <div>
      <Card className='w-fit'>
        <CardContent>
          <CardDescription>Signed in as </CardDescription>
          <CardTitle>{user.preferred_name ?? user.name}</CardTitle>
        </CardContent>
        <CardFooter>
          <Button variant="link" onClick={auth.logout} className='gap-2 w-full text-destructive px-0'><LogOut className='w-4 h-4' /> Sign Out</Button>
        </CardFooter>
      </Card>
    </div>
    <UserFormCard user={user} className="max-w-2xl" />
  </div>
}
