import { IOrder, OrderStatus, OrderStatusColor } from "@/types/order";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import { MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import FlagModal from "./FlagModal";
import { useOrderStore } from "@/store/useOrderStore";
import { useState } from "react";

interface OrderProps {
  order: IOrder;
}

const Order: React.FC<OrderProps> = ({ order }) => {
  const { cancelOrderByUser } = useOrderStore();
  const [openCancelModal, setOpenCancelModal] = useState(false);

  const handleOrderCancel = async (order: IOrder) => {
    try {
      if (
        order.status === OrderStatus.CANCELLED ||
        order.status === OrderStatus.DELIVERED
      ) {
        return;
      }
      setOpenCancelModal(true);
    } catch (error) {
      setOpenCancelModal(false);
    }
  };

  return (
    <Card key={order._id!}>
      <CardHeader>
        <CardTitle>{order.restaurant?.name}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1" />
          {`${order.restaurant?.address?.street}, ${order.restaurant?.address?.city}`}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {order.items.slice(0, 3).map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>{item.name}</span>
              <span>x{item.quantity}</span>
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="text-sm text-muted-foreground">
              +{order.items.length - 3} more items
            </div>
          )}
          <div className="font-bold mt-2">
            Total: ₹{order.totalAmount.toFixed(2)}
          </div>
        </div>
      </CardContent>
      <CardFooter className="md:flex-row flex-col justify-between gap-2">
        <div>
          {order.status === OrderStatus.DELIVERED ? (
            <Button variant="outline" asChild>
              <Link to={`/restaurant/${order.restaurantId}`}>View Menu</Link>
            </Button>
          ) : (
            <div className="flex items-center">
              <span
                className={`h-4 w-4 rounded-full inline-block mr-2 bg-${
                  OrderStatusColor[
                    order?.status?.toUpperCase() as keyof typeof OrderStatusColor
                  ]
                }-500`}
              ></span>
              <span>{order.status?.toUpperCase()}</span>
            </div>
          )}
        </div>
        <div>
          {order.status === OrderStatus.DELIVERED ||
          order.status === OrderStatus.CANCELLED ? (
            <Button
              variant="outline"
              className={`w-24 bg-${
                OrderStatusColor[
                  order?.status?.toUpperCase() as keyof typeof OrderStatusColor
                ]
              }-500 text-slate-200`}
            >
              {order.status?.toUpperCase()}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => handleOrderCancel(order)}
              >
                Cancel
              </Button>
              <Button variant="link" className="w-24 bg-green-600 text-white">
                Track Order
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
      <FlagModal
        isOpen={openCancelModal}
        onClose={() => setOpenCancelModal(false)}
        title="Cancel Order"
        confirmOption="Cancel"
        onSubmit={cancelOrderByUser}
        order={order}
      />
    </Card>
  );
};

export { Order };
