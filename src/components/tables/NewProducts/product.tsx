"use client"
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
      <TableCell className="font-medium">{product.Ref}</TableCell>
      <TableCell className="hidden sm:table-cell">
        {product.Image && (
          <Image
            alt="Product image"
            className="aspect-square rounded-md object-cover"
            height="64"
            src={product.Image}
            width="64"
          />
        )}
      </TableCell>
      <TableCell className="font-medium">
        <a href={product.Link} target="_blank" className="hover:underline">
          {product.Designation}
        </a>
      </TableCell>
      <TableCell className="hidden md:table-cell">{product.Subcategory}</TableCell>
      <TableCell className="hidden md:table-cell">{product.Brand}</TableCell>
      <TableCell>
        <Badge variant={product.Stock === "En stock" ? "success" : "alert"} className="capitalize">
          {product.Stock}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {new Date(product.DateScrapping).toLocaleDateString("fr-FR")}
      </TableCell>
      <TableCell className="hidden md:table-cell font-bold">{`${product.Price.toFixed(3)} DT`}</TableCell>
      <TableCell className="hidden md:table-cell">
        <Button variant="outline" onClick={() => {
          setSelectedProduct(product);
        }}>
          Voir
        </Button>
      </TableCell>
    </TableRow>
  );
}
