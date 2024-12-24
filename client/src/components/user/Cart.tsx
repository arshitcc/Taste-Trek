import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import CheckoutPage from "../Checkout";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CartItem } from "../CartItem";
import { IndianRupeeIcon } from "lucide-react";

const Cart = () => {
  const [open, setOpen] = useState(false);
  const { items, getCartItems, deleteCart } = useCartStore();
  const [totalAmount, setTotalAmount] = useState(0);
  const { restaurantId } = useParams();

  useEffect(() => {
    if (restaurantId) {
      getCartItems(restaurantId);
    }
  }, [getCartItems, restaurantId]);

  useEffect(() => {
    const newTotal = items.reduce(
      (acc: number, item) => acc + item.price * item.quantity,
      0
    );
    setTotalAmount(newTotal);
  }, [items]);

  const handleClearCart = () => {
    deleteCart(restaurantId!);
  };

  const handleProceedToCheckout = () => {
    setOpen(true);
  };

  return (
    <div className="flex flex-col max-w-7xl mx-auto my-10">
      <div className="flex justify-end">
        <Button variant="link" onClick={handleClearCart}>
          Clear All
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Items</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(
            (item) =>
              item.quantity > 0 && <CartItem key={item.foodId} item={item} />
          )}
        </TableBody>
        <TableFooter>
          <TableRow className="text-2xl font-bold">
            <TableCell colSpan={5}>Total</TableCell>
            <TableCell className="text-right flex items-center justify-end">
              <IndianRupeeIcon className="mr-1" />
              {totalAmount.toFixed(2)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <div className="flex justify-end my-5">
        <Button onClick={handleProceedToCheckout}>Proceed To Checkout</Button>
      </div>

      <CheckoutPage open={open} setOpen={setOpen} />
    </div>
  );
};

export default Cart;
