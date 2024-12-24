import { TableRow, TableCell } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";
import { ICartItem } from "@/types/cart";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCartStore } from "@/store/useCartStore";

interface CartItemProps {
  item: ICartItem;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { items, addToCart, removeFromCart } = useCartStore();
  const initialQuantity =
    items.find((cartItem) => cartItem.foodId === item.foodId)?.quantity || -1;
  const [quantity, setQuantity] = useState(initialQuantity);
  const { restaurantId } = useParams();

  const increaseQuantity = async () => {
    if (quantity === -1) {
      setQuantity(1);
      await addToCart(restaurantId!, {
        foodId: item.foodId,
        name: item.name,
        price: item.price,
        quantity: 1,
        maxQuantity: item.maxQuantity,
      });
    } else if (quantity < item.maxQuantity) {
      setQuantity((prev) => prev + 1);
      await addToCart(restaurantId!, {
        foodId: item.foodId,
        name: item.name,
        price: item.price,
        quantity: quantity + 1,
        maxQuantity: item.maxQuantity,
      });
    }
  };

  const decreaseQuantity = async () => {
    if (quantity === 1) {
      setQuantity(-1);
      await removeFromCart(restaurantId!, item.foodId);
    } else if (quantity > 1) {
      setQuantity((prev) => prev - 1);
      await addToCart(restaurantId!, {
        foodId: item.foodId,
        name: item.name,
        price: item.price,
        quantity: quantity - 1,
        maxQuantity: item.maxQuantity,
      });
    }
  };

  const handleRemoveFoodItem = async () => {
    await removeFromCart(restaurantId!, item.foodId);
    setQuantity(-1);
  }

  return (
    <TableRow>
      <TableCell>
        <Avatar>
          <AvatarImage src={""} alt="" />
          <AvatarFallback>
            {item.name[0] + item.name[item.name.length - 1]}
          </AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell> {item.name}</TableCell>
      <TableCell> {item.price}</TableCell>
      <TableCell>
        <div className="w-fit flex items-center rounded-full border border-gray-100 dark:border-gray-800 shadow-md">
          <Button
            onClick={decreaseQuantity}
            size={"icon"}
            variant={"outline"}
            className="rounded-full bg-gray-200"
          >
            <Minus />
          </Button>
          <Button
            size={"icon"}
            className="font-bold border-none"
            disabled
            variant={"outline"}
          >
            {quantity}
          </Button>
          <Button
            onClick={increaseQuantity}
            size={"icon"}
            className="rounded-full "
            variant={"outline"}
          >
            <Plus />
          </Button>
        </div>
      </TableCell>
      <TableCell>{item.price * quantity}</TableCell>
      <TableCell className="text-right">
        <Button size={"sm"} onClick={handleRemoveFoodItem}>Remove</Button>
      </TableCell>
    </TableRow>
  );
};
