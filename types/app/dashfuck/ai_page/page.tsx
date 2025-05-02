const Pagination = require('@/components/ui/pagination');
const Label = require('@/components/ui/label');

type ActionType = {
    type: string;
    payload?: any;
};

type ProductType = {
    id: number;
    name: string;
    price: number;
};

export default function Page({ action }: { action: ActionType }) {
    const product: ProductType = { id: 1, name: 'Sample Product', price: 100 };

    return (
        <div>
            <Label text={product.name} />
            <Pagination currentPage={1} totalPages={10} />
        </div>
    );
}