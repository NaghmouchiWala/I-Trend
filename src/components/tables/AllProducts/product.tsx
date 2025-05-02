// "use client"
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { ProductRo } from '@/types/product';
import { Button } from '@/components/ui/button';

interface Props {
  product: ProductRo;
  setSelectedProduct: (product: ProductRo) => void;
}

export function Product({product, setSelectedProduct}: Props) {
  return (
    <TableRow>
      <TableCell>{product.Ref}</TableCell>
      <TableCell>
        {product.Image && (
          <Image
            src={product.Image}
            alt={product.Designation}
            width={50}
            height={50}
            className="rounded-md"
          />
        )}
      </TableCell>
      <TableCell>{product.Designation}</TableCell>
      <TableCell>
        <Badge variant="outline">{product.Subcategory}</Badge>
      </TableCell>
      <TableCell>{product.Brand}</TableCell>
      <TableCell>
        <Badge variant={product.Stock === "Non spécifié" ? "destructive" : "outline"}>
          {product.Stock === "Non spécifié" ? "Hors stock" : product.Stock}
        </Badge>
      </TableCell>
      <TableCell>
        {product.Modifications?.[0]?.dateModification 
          ? new Date(product.Modifications[0].dateModification).toLocaleDateString("fr-FR") 
          : '-'}
      </TableCell>
      <TableCell>
  {`${Number(product.Price || 0).toFixed(3)} DT`}
</TableCell>
          
      <TableCell>
        <Button onClick={() => setSelectedProduct(product)}>
          Voir
        </Button>
      </TableCell>
    </TableRow>
  );
}