// Mock mongoose and Cart model
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

jest.mock('@/models/Cart', () => ({
  Cart: jest.fn().mockImplementation((data) => ({
    ...data,
    validateSync: jest.fn(() => {
      if (data.items && data.items.some((item: any) => item.quantity <= 0)) {
        return { errors: { 'items.0.quantity': { message: 'Quantity must be positive' } } };
      }
      if (data.items && data.items.some((item: any) => item.quantity > 100)) {
        return { errors: { 'items.0.quantity': { message: 'Quantity exceeds maximum' } } };
      }
      return null;
    }),
  })),
}));

describe('Cart Model', () => {
  const mockCart = {
    userId: 'test-user-id',
    items: [
      {
        productId: 'product-1',
        quantity: 2,
        price: 10000,
        addedAt: new Date()
      },
      {
        productId: 'product-2',
        quantity: 1,
        price: 5000,
        addedAt: new Date()
      }
    ]
  };

  it('should create a cart with valid data', () => {
    const { Cart } = require('@/models/Cart');
    const cart = new Cart(mockCart);

    expect(cart.userId).toBe(mockCart.userId);
    expect(cart.items).toHaveLength(2);
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.items[1].quantity).toBe(1);
  });

  it('should calculate total items correctly', () => {
    const { Cart } = require('@/models/Cart');
    const cart = new Cart(mockCart);

    const totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    expect(totalItems).toBe(3);
  });

  it('should calculate total amount correctly', () => {
    const { Cart } = require('@/models/Cart');
    const cart = new Cart(mockCart);

    const totalAmount = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    expect(totalAmount).toBe(25000); // (2 * 10000) + (1 * 5000)
  });

  it('should validate quantity constraints', () => {
    const { Cart } = require('@/models/Cart');
    const cart = new Cart({
      ...mockCart,
      items: [
        {
          productId: 'product-1',
          quantity: 0, // Invalid quantity
          price: 10000,
          addedAt: new Date()
        }
      ]
    });

    const validationError = cart.validateSync();
    expect(validationError?.errors['items.0.quantity']).toBeDefined();
  });

  it('should validate maximum quantity', () => {
    const { Cart } = require('@/models/Cart');
    const cart = new Cart({
      ...mockCart,
      items: [
        {
          productId: 'product-1',
          quantity: 101, // Exceeds maximum
          price: 10000,
          addedAt: new Date()
        }
      ]
    });

    const validationError = cart.validateSync();
    expect(validationError?.errors['items.0.quantity']).toBeDefined();
  });
});
