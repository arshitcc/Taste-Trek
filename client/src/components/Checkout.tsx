import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IndianRupeeIcon, Clock, MapPin, Phone, User, StoreIcon, HomeIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useOrderStore } from "@/store/useOrderStore";
import { PaymentMethod, PaymentStatus } from "@/types/order";

interface CheckoutModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CheckoutPage: React.FC<CheckoutModalProps> = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const { carts } = useCartStore();
  const { restaurantId } = useParams();
  if (!restaurantId) {
    navigate("/orders");
    return;
  }
  const { items, deleteCart } = useCartStore();
  const { user } = useUserStore();
  const [deliveryTime, setDeliveryTime] = useState(0);
  const [fullName, setFullName] = useState(user?.fullname || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const totalAmount = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const { initiateOrder } = useOrderStore();
  const [isGift, setIsGift] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
 
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    setDeliveryTime(Math.floor(Math.random() * (40 - 25 + 1) + 25));
  }, []);

  const cart = carts.find((myCart) => myCart.restaurant._id === restaurantId);

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);

    if(!user?.addresses.length){
      return;
    }
    const estimatedDeliveryTime = new Date(Date.now() + 40 * 60 * 1000);
    await initiateOrder({
      restaurantId: restaurantId!,
      items,
      totalAmount,
      deliveryAddress: user?.addresses?.[0],
      estimatedDeliveryTime,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PENDING,
      preparationTime: 40,
      isGift,
      specialInstructions
    });    
    
    await deleteCart(restaurantId!);
    setPlacingOrder(false);
    navigate("/orders");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[60%] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl font-bold">Checkout</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow px-6 py-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{cart?.restaurant.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.foodId} className="flex justify-between">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold">
                  <span>Total Amount</span>
                  <span className="flex items-center">
                    <IndianRupeeIcon className="w-4 h-4 mr-1" />
                    {totalAmount.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <StoreIcon className="w-5 h-5 mr-2 mt-1" />
                  <div>
                    <h4 className="font-semibold">From :</h4>
                    <p>{cart?.restaurant.address?.street}</p>
                    <p>
                      {cart?.restaurant.address?.city},{" "}
                      {cart?.restaurant.address?.state}
                    </p>
                    <p>{cart?.restaurant.address?.pincode}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>Estimated Delivery Time: {deliveryTime} mins</span>
                </div>

                {!user?.addresses.length ? (
                  <div className="flex flex-col items-start">
                    <p className="text-gray-500 mb-2">
                      No delivery address found.
                    </p>
                    <Button
                      onClick={() => setOpen(false)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <HomeIcon className="w-5 h-5 mr-2 mt-1" />
                    <div>
                      <h4 className="font-semibold">To :</h4>
                      <p>{user.addresses[0].street}</p>
                      <p>
                        {user.addresses[0].city}, {user.addresses[0].state}
                      </p>
                      <p>{user.addresses[0].pincode}</p>
                    </div>
                  </div>
                )}

                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    <Label htmlFor="fullName">Full Name</Label>
                  </div>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    <Label htmlFor="phone">Phone</Label>
                  </div>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center ">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={() => setIsGift(!isGift)}
                  />
                  <span className="ml-2">Is Gift?</span>
                </div>
                <div className="flex flex-col items-start">
                  <Label htmlFor="specialInstructions">
                    Special Instructions
                  </Label>
                  <textarea
                    id="specialInstructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full h-20 p-2 border border-gray-300 rounded mt-3"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
        <div className="mt-auto px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t">
          <Button
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
          >
            {placingOrder? "Placing Order ..." : `₹${totalAmount.toFixed(2)} Place Order`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutPage;
