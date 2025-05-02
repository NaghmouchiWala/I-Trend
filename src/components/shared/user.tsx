/*import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { User } from '@/data/user';
import { useRouter } from 'next/navigation';

export function User() {
  const router = useRouter();
  
  const logout = () => {
    localStorage.removeItem('token');
    router.push('/');
  }  
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild  className="bg-background border-b">
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full"
        >
          <Image
            src={'/images/fnac.png'}
            width={36}
            height={36}
            alt="Avatar"
            className="overflow-hidden rounded-full"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Button size="sm" variant="outline" onClick={logout}>
            Se déconnecter
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
  */
