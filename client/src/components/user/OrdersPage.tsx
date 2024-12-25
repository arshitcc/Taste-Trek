import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
  } from "../ui/card";
  import { Skeleton } from "../ui/skeleton";
  import { IOrder } from "@/types/order";
  import { useOrderStore } from "@/store/useOrderStore";
  import { NoResultFound } from "../NoResultFound";
  import { useUserStore } from "@/store/useUserStore";
  import { useEffect } from "react";
  import { Order } from "../Order";
  
  const OrdersPage = () => {
    const { isLoading, userOrders, getUserOrders } = useOrderStore();
    const { user } = useUserStore();
  
    useEffect(() => {
      const fetchUserOrders = async () => {
        await getUserOrders();
      };
      fetchUserOrders();
    }, [user?._id, getUserOrders]);
  
    return (
      <div className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
        {!isLoading && !userOrders?.length ? (
          <NoResultFound
            searchCollection="Orders"
            message="Go & Grab some Food"
          />
        ) : (
          userOrders.map((order: IOrder) => (
            <Order key={order._id} order={order} />
          ))
        )}
      </div>
    );
  };
  
  export const OrdersPageSkeleton = () => {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  export default OrdersPage;
  