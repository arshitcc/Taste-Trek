import { useRestaurantStore } from "@/store/useRestaurantStore";
import { useCartStore } from "@/store/useCartStore";
import FoodItem from "../FoodItem";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { Timer } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { NoResultFound } from "../NoResultFound";

const RestaurantPage = () => {
  const params = useParams();
  const { isLoading, restaurant, getRestaurantByID } = useRestaurantStore();
  const { getCartItems } = useCartStore();

  useEffect(() => {
    if (params.restaurantId) {
      getCartItems(params.restaurantId);
      getRestaurantByID(params.restaurantId);
    }
  }, [params.restaurantId]);

  return (
    <div className="max-w-6xl mx-auto my-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="relative w-full h-32 sm:h-48 md:h-64 lg:h-72">
          <img
            src={
              restaurant?.image ||
              "https://images.pexels.com/photos/27019303/pexels-photo-27019303.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
            }
            alt="res_image"
            className="object-cover w-full h-full rounded-lg shadow-lg"
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4">
          <div className="my-5">
            <h1 className="font-medium text-xl sm:text-2xl lg:text-3xl">
              {restaurant?.name || "Loading..."}
            </h1>
            <div className="flex flex-wrap gap-2 my-2">
              {restaurant?.cuisine?.map((cuisine: string, idx: number) => (
                <Badge key={idx}>{cuisine}</Badge>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 my-5">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                <h1 className="flex items-center gap-2 font-medium">
                  Delivery Time:{" "}
                  <span className="text-[#D19254]">
                    {restaurant?.deliveryTime || "40"} mins
                  </span>
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold mb-6">
            Available Menus
          </h1>
          <div
            className={`grid ${
              isLoading ||
              (restaurant?.foodItems && restaurant.foodItems.length > 0)
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            } gap-4 sm:gap-6 lg:gap-8`}
          >
            {isLoading ? (
              <FoodItemSkeleton />
            ) : !isLoading && restaurant?.foodItems?.length === 0 ? (
              <NoResultFound />
            ) : (
              Array.isArray(restaurant?.foodItems) &&
              restaurant?.foodItems?.map((foodItem) => (
                <FoodItem key={foodItem?.name} foodItem={foodItem} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FoodItemSkeleton = () => {
  return (
    <>
      {[...Array(3)].map((_, index) => (
        <Card
          key={index}
          className="p-2 flex flex-col sm:flex-row md:flex-col gap-2 items-start max-w-full md:max-w-sm mx-auto shadow-lg rounded-lg overflow-hidden w-full"
        >
          <div className="w-full sm:w-1/3 md:w-full h-40 sm:h-full md:h-40 object-cover rounded-lg bg-gray-300 dark:bg-gray-700">
            <Skeleton className="w-full h-full" />
          </div>
          <CardContent className="p-4 flex-1 flex flex-col justify-between w-full">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mt-2" />
            <Skeleton className="h-6 w-1/4 mt-4" />
          </CardContent>
          <CardFooter className="p-4 w-full">
            <Skeleton className="h-10 w-24 rounded-full" />
          </CardFooter>
        </Card>
      ))}
    </>
  );
};

export default RestaurantPage;
