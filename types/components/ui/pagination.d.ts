export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (action: string) => void;
}

declare module '@/components/ui/pagination' {
    export const Pagination: React.FC<PaginationProps>;
}