import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ICartItem } from "@/types/cart";
import { IndianRupeeIcon, UtensilsCrossed } from 'lucide-react';

export default function Carts() {
  const { carts, getCarts, isLoading } = useCartStore();

  useEffect(() => {
    getCarts();
  }, [getCarts]);

  const calculateTotalAmount = (items: ICartItem[]) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!carts || carts.length === 0) {
    return (
      <div className="container mx-auto py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <UtensilsCrossed className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-center">Your cart is empty</h1>
        <p className="text-gray-600 mb-6 text-center">Feeling hungry? Let's add some delicious food!</p>
        <Link to="/">
          <Button className="w-full sm:w-auto">Explore Restaurants</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Your Carts</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {carts.map((cart) => (
          <Card key={cart._id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{cart.restaurant.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {cart?.restaurant?.address?.street}
                </p>
                <p className="font-semibold mb-4 flex items-center">
                  Total Amount: <IndianRupeeIcon className="w-4 h-4 ml-1 mr-1" />
                  {calculateTotalAmount(cart.items).toFixed(2)}
                </p>
              </div>
              <Link to={`/cart/${cart.restaurant._id}`} className="mt-auto">
                <Button className="w-full">View Cart</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

