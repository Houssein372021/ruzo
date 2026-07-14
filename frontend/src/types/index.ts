export type Language = "en" | "ar";

export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type Category = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  imageUrl?: string | null;
  isActive?: boolean | null;
  sortOrder?: number | null;
  createdAt?: string | null;
};

export type ProductImage = {
  id: string;
  imageUrl: string;
  url?: string | null;
  sortOrder?: number | null;
};

export type ProductVariant = {
  id: string;
  color: string;
  colorHex?: string | null;
  size: string;
  stock: number;
  imageUrl?: string | null;
};

export type Product = {
  id: string;
  slug: string;
  category: Category | null;
  nameEn: string;
  nameAr: string;
  shortDescriptionEn?: string | null;
  shortDescriptionAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  price: number;
  salePrice?: number | null;
  badge?: string | null;
  isNew?: boolean | null;
  isBestSeller?: boolean | null;
  featuredMenu?: boolean | null;
  featuredMenuOrder?: number | null;
  active?: boolean | null;
  isActive?: boolean | null;
  videoUrl?: string | null;
  avgRating?: number | null;
  reviewCount?: number | null;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type FavoriteItem = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  price: number;
  imageUrl?: string | null;
  categorySlug?: string | null;
};

export type CartItem = FavoriteItem & {
  lineId: string;
  variantId?: string;
  color?: string;
  colorHex?: string | null;
  size?: string;
  quantity: number;
};

export type CustomerInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  city: string;
  country?: string;
  address: string;
  notes?: string;
};

export type OrderPayload = {
  language: Language;
  customer: CustomerInfo;
  paymentMethod: string;
  items: Array<{
    productId: string;
    variantId?: string;
    slug: string;
    name: string;
    color?: string;
    size?: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export type OrderResponse = {
  id?: string;
  orderNumber?: string;
  number?: string;
  status?: OrderStatus;
};

export type AdminLoginResponse = {
  token: string;
  user?: {
    name?: string;
    email?: string;
  };
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  notes?: string;
  paymentMethod?: string;
  reviewToken?: string;
  reviewRequestSentAt?: string | null;
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  status: OrderStatus;
  createdAt?: string;
  items?: AdminOrderItem[];
  products?: string[];
};

export type AdminOrderItem = {
  id: string;
  productName: string;
  color?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type AdminCustomer = {
  id: string;
  customerIds?: string[];
  name: string;
  email?: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  lastOrder?: string;
  orders?: AdminOrder[];
};

export type AdminDashboard = {
  totalOrders: number;
  totalSales: number;
  recentOrders: AdminOrder[];
  topProducts: Product[];
  recentCustomers: AdminCustomer[];
};

export type Review = {
  id: string;
  productId?: string;
  customerName: string;
  customerEmail?: string | null;
  rating: number;
  title?: string | null;
  body: string;
  status?: ReviewStatus;
  verifiedPurchase?: boolean;
  createdAt?: string;
};

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ReviewPayload = {
  productId: string;
  customerName?: string;
  customerEmail?: string;
  rating: number;
  title?: string;
  body: string;
};

export type ReviewInvitation = {
  orderNumber: string;
  reviewOpen: boolean;
  products: ReviewInvitationProduct[];
};

export type ReviewInvitationProduct = {
  productId: string;
  productName: string;
  imageUrl?: string | null;
};

export type AdminReview = Review & {
  productName: string;
  orderNumber: string;
};
