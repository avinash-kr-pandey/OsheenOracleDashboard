// src/types/product.ts - FINAL VERSION

export interface Review {
  id?: string;
  name: string;
  comment: string;
  rating: number;
  date: string;
  avatar: string;
}

export interface Product {
  // ✅ Required core fields
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  colors?: string[];

  // ✅ Optional fields
  id?: string; // For compatibility
  originalPrice?: number;
  description?: string;
  inStock?: boolean;
  rating?: number;
  gender?: string[];
  isNew?: boolean;
  images?: string[];
  size?: string[];
  color?: string[];
  reviews?: Review[];
  tags?: string[];
  stock?: number;
  sku?: string;
  weight?: number;

  // ✅ Features
  features?: {
    freeShipping?: boolean;
    returns?: string;
    warranty?: string;
    authentic?: boolean;
    material?: string;
    careInstructions?: string;
  };

  // ✅ Shipping Info
  shippingInfo?: {
    delivery?: string;
    returnPolicy?: string;
    securePayment?: boolean;
    shippingTime?: string;
    freeShippingEligible?: boolean;
  };

  // ✅ Timestamps
  createdAt?: string;
  updatedAt?: string;
  __v?: number;

  // ✅ SEO fields
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
}

// ✅ Helper function to normalize product data
export function normalizeProduct(product: any): Product {
  return {
    // Required fields with defaults
    _id: String(product._id || product.id || ""),
    name: product.name || "Unnamed Product",
    price: Number(product.price) || 0,
    image: product.image || product.images?.[0] || "/placeholder.jpg",
    category: product.category || "Uncategorized",
    brand: product.brand || "Generic",

    // Optional fields
    id: product.id || product._id,
    originalPrice: product.originalPrice
      ? Number(product.originalPrice)
      : undefined,
    description: product.description,
    inStock: product.inStock ?? true,
    rating: product.rating ? Number(product.rating) : 0,
    gender: Array.isArray(product.gender) ? product.gender : [],
    isNew: product.isNew ?? false,
    images: Array.isArray(product.images)
      ? product.images
      : [product.image || "/placeholder.jpg"],
    size: Array.isArray(product.size) ? product.size : [],
    color: Array.isArray(product.color) ? product.color : [],
    reviews: Array.isArray(product.reviews) ? product.reviews : [],
    tags: Array.isArray(product.tags) ? product.tags : [],
    stock: product.stock ? Number(product.stock) : undefined,
    sku: product.sku,
    weight: product.weight ? Number(product.weight) : undefined,

    // Features
    features: product.features || {},

    // Shipping info
    shippingInfo: product.shippingInfo || {},

    // Timestamps
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    __v: product.__v,

    // SEO
    slug: product.slug,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
  };
}

// ✅ Type guard
export function isProduct(data: any): data is Product {
  return (
    data &&
    typeof data === "object" &&
    typeof data.name === "string" &&
    typeof data.price === "number" &&
    typeof data._id === "string"
  );
}
