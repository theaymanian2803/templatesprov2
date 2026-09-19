import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Cart = () => {
  const { items, removeFromCart, totalPrice, clearCart } = useCart();
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-9 pb-16">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8">
            {t('cart.title')}
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.emptyTitle')}</h2>
              <p className="text-gray-500 mb-6">
                {t('cart.emptyDesc')}
              </p>
              <Link to="/templates">
                <Button className="bg-orange-500 text-white hover:bg-orange-600 font-semibold gap-2">
                  {t('cart.browse')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4"
                  >
                    <Link to={`/template/${item.id}`}>
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link to={`/template/${item.id}`}>
                        <h3 className="font-bold text-gray-900 hover:text-orange-500 transition-colors">
                          {item.title}
                        </h3>
                      </Link>
                    </div>
                    <div className="text-right flex flex-col items-end gap-3">
                      <div className="font-bold text-xl text-gray-900">${item.price}</div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label={t('cart.remove', { title: item.title })}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                <Button
                  onClick={clearCart}
                  className="bg-orange-500 text-white hover:bg-orange-600 font-semibold"
                >
                  {t('cart.clear')}
                </Button>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-24">
                  <h2 className="font-bold text-lg text-gray-900 mb-4">{t('cart.summary')}</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t('cart.subtotal', { count: items.length })}</span>
                      <span className="text-gray-900">${totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t('cart.discount')}</span>
                      <span className="text-orange-500">-$0</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="font-bold text-gray-900">{t('cart.total')}</span>
                      <span className="font-extrabold text-2xl text-orange-500">${totalPrice}</span>
                    </div>
                  </div>

                  <Link to="/checkout">
                    <Button className="w-full bg-orange-500 text-white hover:bg-orange-600 font-semibold gap-2">
                      {t('cart.checkout')}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>

                  <p className="text-xs text-gray-400 text-center mt-4">
                    {t('cart.secure')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default Cart;