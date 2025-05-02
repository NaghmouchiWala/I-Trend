interface ProductModification {
  ancienPrix: number;
  dateModification: string;
  nouveauPrix: number;
}

export interface ProductRo {
  name: string;
  image_url?: string;
  url?: string;
  dateModification?: string;
  reference: string;
  tunisianet_name: any;
  mytek_name: any;
  tunisianet_reference: string;
  name_similarity_score: any;
  reference_similarity_score: any;
  average_similarity_score: any;
  mytek_reference: string;
  Brand: string;
  BrandImage: string;
  Category: string;
  Company: string;
  CompanyLogo: string;
  DateScrapping: string;
  Description: string;
  Designation: string;
  DiscountAmount: string;
  Image: string;
  Link: string;
  Modifications: ProductModification[];
  Price: number;
  Ref: string;
  Stock: string;
  Subcategory: string;
  Source: 'tunisianet' | 'mytek';
  _id: string;
  yesterday_counts: {
    added_yesterday: number;
    modified_yesterday: number;
  };
  stock_counts: {
    nbre_product_instock: number;
    nbre_product_outofstock: number;
    nbre_product_surcommonde: number;
  };
  price_change_counts: {
    nbre_price_increase: number;
    nbre_price_decrease: number;
  };
}
