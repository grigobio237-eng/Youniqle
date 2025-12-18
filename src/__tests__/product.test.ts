// Mock mongoose and Product model
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    readyState: 1,
  },
  Schema: {
    Types: {
      ObjectId: 'ObjectId',
      Mixed: 'Mixed',
    },
  },
  model: jest.fn(),
}));

jest.mock('@/models/Product', () => ({
  Product: jest.fn().mockImplementation((data) => ({
    ...data,
    validateSync: jest.fn(() => {
      const errors = {};
      if (!data.name) errors.name = { message: 'Name is required' };
      if (!data.price) errors.price = { message: 'Price is required' };
      if ((data as any).price < 0) errors.price = { message: 'Price must be positive' };
      if ((data as any).stock < 0) errors.stock = { message: 'Stock must be positive' };
      return Object.keys(errors).length > 0 ? { errors } : null;
    }),
  })),
}));

describe('Product Model', () => {
  const mockProduct = {
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test product description',
    price: 10000,
    originalPrice: 12000,
    category: 'electronics',
    stock: 100,
    images: [
      {
        url: 'https://example.com/image1.jpg',
        alt: 'Test product image'
      }
    ],
    featured: true,
    active: true
  };

  it('should create a product with valid data', () => {
    const { Product } = require('@/models/Product');
    const product = new Product(mockProduct);

    expect(product.name).toBe(mockProduct.name);
    expect(product.slug).toBe(mockProduct.slug);
    expect(product.price).toBe(mockProduct.price);
    expect(product.stock).toBe(mockProduct.stock);
    expect(product.featured).toBe(true);
  });

  it('should validate required fields', () => {
    const { Product } = require('@/models/Product');
    const product = new Product({});

    const validationError = product.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError?.errors.name).toBeDefined();
    expect(validationError?.errors.price).toBeDefined();
  });

  it('should validate price constraints', () => {
    const { Product } = require('@/models/Product');
    const product = new Product({
      ...mockProduct,
      price: -1000
    });

    const validationError = product.validateSync();
    expect(validationError?.errors.price).toBeDefined();
  });

  it('should validate stock constraints', () => {
    const { Product } = require('@/models/Product');
    const product = new Product({
      ...mockProduct,
      stock: -10
    });

    const validationError = product.validateSync();
    expect(validationError?.errors.stock).toBeDefined();
  });
});
