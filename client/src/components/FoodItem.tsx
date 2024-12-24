import { useCartStore } from "@/store/useCartStore";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { IFood } from "@/types/food";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface FoodItemProps {
  foodItem: IFood;
}

const FoodItem: React.FC<FoodItemProps> = ({ foodItem }) => {
  const { items, addToCart, removeFromCart } = useCartStore();
  const initialQuantity =
    items?.find((item) => item.foodId === foodItem._id)?.quantity || -1;
  const [quantity, setQuantity] = useState(initialQuantity);
  const { restaurantId } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const updateQueue: { type: "increase" | "decrease"; quantity: number }[] = [];

  const increaseQuantity = async () => {
    if (quantity === -1) {
      setIsLoading(true);
    }
    const newQuantity = quantity === -1 ? 1 : quantity + 1;
    updateQueue.push({ type: "increase", quantity: newQuantity });
    processUpdateQueue();
  };

  const decreaseQuantity = async () => {
    const newQuantity = quantity === 1 ? -1 : quantity - 1;
    updateQueue.push({ type: "decrease", quantity: newQuantity });
    processUpdateQueue();
  };

  const processUpdateQueue = async () => {
    if (updateQueue.length === 0) return;

    try {
      const update = updateQueue.shift();
      if (update?.type === "increase" && quantity < foodItem.maxQuantity) {
        if (quantity === -1) setQuantity(1);
        else if (quantity >= 1) setQuantity((prev) => prev + 1);
        await addToCart(restaurantId!, {
          foodId: foodItem._id!,
          name: foodItem.name,
          price: foodItem.price,
          quantity: update.quantity,
          maxQuantity: foodItem.maxQuantity,
        });
      } else if (update?.type === "decrease") {
        setQuantity((prev) => {
          if (prev === 1) {
            removeFromCart(restaurantId!, foodItem._id!);
            return -1;
          }
          return prev - 1;
        });
        if (quantity > 1) {
          await addToCart(restaurantId!, {
            foodId: foodItem._id!,
            name: foodItem.name,
            price: foodItem.price,
            quantity: update.quantity,
            maxQuantity: foodItem.maxQuantity,
          });
        }
      }
      processUpdateQueue();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="col-span-1 p-2 flex flex-col sm:flex-row md:flex-col gap-2 items-start max-w-full md:max-w-sm mx-auto shadow-lg rounded-lg overflow-hidden w-full">
      <img
        src={foodItem.image}
        alt={foodItem.name}
        className="w-full sm:w-1/3 md:w-full h-40 sm:h-full md:h-40 object-cover rounded-lg"
      />
      <CardContent className="p-4 flex-1 flex flex-col justify-between w-full">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {foodItem.name}
        </h2>
        <p className="text-sm text-gray-600 mt-2">{foodItem.description}</p>
        <h3 className="text-lg font-semibold mt-4">
          Price: <span className="text-[#D19254]">₹{foodItem.price}</span>
        </h3>
      </CardContent>
      <CardFooter className="p-4 w-full">
        {quantity > 0 ? (
          <div className="flex items-center">
            <Button
              onClick={decreaseQuantity}
              disabled={isLoading}
              className="mr-2 rounded-full w-8 h-8"
            >
              -
            </Button>
            <span className="text-lg font-semibold">{quantity}</span>
            <Button
              onClick={increaseQuantity}
              disabled={isLoading}
              className="ml-2 rounded-full w-8 h-8"
            >
              +
            </Button>
          </div>
        ) : (
          <Button onClick={increaseQuantity} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FoodItem;
