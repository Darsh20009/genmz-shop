import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@shared/schema';

// Cart specific types
export interface CartItem {
  productId: string;
  variantSku: string;
  quantity: number;
  price: number;
  title: string;
  image: string;
  color?: string;
  size?: string;
}

interface CartStore {
  items: CartItem[];
  loadCart: () => Promise<void>;
  addItem: (product: Product, variant: any, quantity: number) => void;
  removeItem: (productId: string, variantSku: string) => void;
  updateQuantity: (productId: string, variantSku: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      loadCart: async () => {
        try {
          const res = await fetch('/api/cart/load');
          if (res.ok) {
            const data = await res.json();
            if (data && data.items) {
              set({ items: data.items });
            }
          }
        } catch (error) {
          console.error("Failed to load cart:", error);
        }
      },
      addItem: (product, variant, quantity) => {
        const items = get().items;
        const existingItem = items.find(
          item => item.productId === product.id && item.variantSku === variant.sku
        );

        let newItems;
        if (existingItem) {
          newItems = items.map(item =>
            item.productId === product.id && item.variantSku === variant.sku
              ? { ...item, quantity: item.quantity + quantity, image: variant.image || item.image }
              : item
          );
        } else {
          newItems = [
            ...items,
            {
              productId: product.id,
              variantSku: variant.sku,
              quantity,
              price: Number(product.price),
              title: product.name,
              image: variant.image || product.images[0] || "",
              color: variant.color,
              size: variant.size,
            },
          ];
        }
        set({ items: newItems });
        // Sync with server
        fetch('/api/cart/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: newItems }),
        }).catch(() => {});
        
        // Abandoned cart tracking
        fetch('/api/abandoned-carts/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: newItems }),
        }).catch(() => {});
      },
      removeItem: (productId, variantSku) => {
        const newItems = get().items.filter(
          item => !(item.productId === productId && item.variantSku === variantSku)
        );
        set({ items: newItems });
        fetch('/api/cart/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: newItems }),
        }).catch(() => {});
      },
      updateQuantity: (productId, variantSku, quantity) => {
        const newItems = get().items.map(item =>
          item.productId === productId && item.variantSku === variantSku
            ? { ...item, quantity }
            : item
        );
        set({ items: newItems });
        fetch('/api/cart/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: newItems }),
        }).catch(() => {});
      },
      clearCart: () => {
        set({ items: [] });
        fetch('/api/cart/clear', { method: 'POST' }).catch(() => {});
      },
      total: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);
