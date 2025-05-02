'use client';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function SearchInput({ search, setSearch }: { search: string, setSearch: (search: string) => void }) {
  return (
    <form className=" flex-1">
      <Search className="absolute left-2.5 top-[.75rem] h-4 w-4 text-muted-foreground" />
      <Input
        name="q"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        type="search"
        placeholder="Recherche..."
        className="w-full rounded-lg bg-background pl-8"
      />
    </form>
  );
}
