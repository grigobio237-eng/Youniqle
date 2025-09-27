import { z } from 'zod';

// User validation schemas
export const signupSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export const addressSchema = z.object({
  label: z.string().min(1, '주소 라벨을 입력해주세요'),
  recipient: z.string().min(2, '수령인 이름을 입력해주세요'),
  phone: z.string().min(10, '올바른 전화번호를 입력해주세요'),
  zip: z.string().min(5, '우편번호를 입력해주세요'),
  addr1: z.string().min(10, '주소를 입력해주세요'),
  addr2: z.string().optional(),
});

// Product validation schemas
export const productSchema = z.object({
  name: z.string().min(1, '상품명을 입력해주세요'),
  slug: z.string().min(1, 'URL 슬러그를 입력해주세요'),
  price: z.number().min(0, '가격은 0원 이상이어야 합니다'),
  stock: z.number().min(0, '재고는 0개 이상이어야 합니다'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  status: z.enum(['active', 'hidden']),
  images: z.array(z.object({
    url: z.string().url('올바른 이미지 URL을 입력해주세요'),
    w: z.number().optional(),
    h: z.number().optional(),
    type: z.string().optional(),
  })),
  summary: z.string().min(10, '상품 요약은 최소 10자 이상이어야 합니다'),
  description: z.string().min(20, '상품 설명은 최소 20자 이상이어야 합니다'),
});

// Order validation schemas
export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, '상품 ID가 필요합니다'),
    qty: z.number().min(1, '수량은 1개 이상이어야 합니다'),
  })).min(1, '주문할 상품을 선택해주세요'),
  addressSnapshot: addressSchema,
  partnerId: z.string().optional(),
});

// Cart validation schemas
export const addToCartSchema = z.object({
  productId: z.string().min(1, '상품 ID가 필요합니다'),
  qty: z.number().min(1, '수량은 1개 이상이어야 합니다'),
});

export const updateCartSchema = z.object({
  productId: z.string().min(1, '상품 ID가 필요합니다'),
  qty: z.number().min(0, '수량은 0개 이상이어야 합니다'),
});

// Query parameter validation
export const productQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular']).optional(),
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartInput = z.infer<typeof updateCartSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;


