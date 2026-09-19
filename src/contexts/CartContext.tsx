import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  title: string;
  image: string;
  price: number;
  license: "regular" | "extended";
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateLicense: (id: string, license: "regular" | "extended") => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  totalItems: number;
  totalPrice: number;
  isAllAccess: boolean;
  setAllAccess: (value: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "template-marketplace-cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [isAllAccess, setIsAllAccess] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (item: CartItem) => {
    if (isAllAccess) setIsAllAccess(false);
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, license: item.license, price: item.price } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateLicense = (id: string, license: "regular" | "extended") => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, license, price: license === "extended" ? 299 : 59 }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setIsAllAccess(false);
  };

  const isInCart = (id: string) => {
    return items.some((item) => item.id === id);
  };

  const setAllAccess = (value: boolean) => {
    if (value) {
      setItems([]);
    }
    setIsAllAccess(value);
  };

  const totalItems = isAllAccess ? 1 : items.length;
  const totalPrice = isAllAccess ? 300 : items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateLicense,
        clearCart,
        isInCart,
        totalItems,
        totalPrice,
        isAllAccess,
        setAllAccess,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
