import { Link, useParams } from "react-router-dom";
import { useOrderStore } from "@/store/useOrderStore";
import { IAddress } from "@/types/user";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";
import {
  IndianRupee,
  MapPin,
  Phone,
  Star,
  Truck,
  Clock,
  CalendarDays,
  User,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { useEffect } from "react";

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const formatAddress = (address: IAddress) => {
  return `${address?.street}, ${address?.city}, ${address?.state} ${address?.pincode}`;
};

const OrderSummary = () => {
  const params = useParams();
  const { isLoading, order, getOrderDetails } = useOrderStore();

  useEffect(() => {
    getOrderDetails(params.orderId!);
  }, []);

  if (isLoading) {
    return <OrderSummarySkeleton />;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {order.restaurant?.name}
          </CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{formatAddress(order.deliveryAddress)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{order.restaurant?.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>{order.restaurant?.rating?.toFixed(1)}</span>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ${item.price?.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span className="font-bold">
              <IndianRupee /> {order.totalAmount?.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span>{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Status:</span>
            <Badge
              variant={
                order.paymentStatus === "paid" ? "default" : "destructive"
              }
            >
              {order.paymentStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-4 h-4" />
                <span className="text-sm text-muted-foreground">
                  Order Placed:
                </span>
                <span>{formatDate(order.orderPlacedAt!)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm text-muted-foreground">
                  Estimated Delivery:
                </span>
                <span>{formatDate(order.estimatedDeliveryTime)}</span>
              </div>
              {order.actualDeliveryTime && (
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground">
                    Actual Delivery:
                  </span>
                  <span>{formatDate(order.actualDeliveryTime)}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{order.status}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm text-muted-foreground">
                  Delivery Address:
                </span>
                <span>{formatAddress(order.deliveryAddress)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm text-muted-foreground">
                  Delivery Partner ID:
                </span>
                <span>{order.deliveryPartnerID}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">
                Order Rating:
              </span>
              <span>{order.rating?.toFixed(1)}</span>
            </div> 
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">
                Delivery Rating:
              </span>
              <span>{order.deliveryRating?.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Preparation Time:
              </span>
              <span> {order.preparationTime} minutes</span>
            </div>
            {order.isGift && <Badge>Gift</Badge>}
            {order.specialInstructions && (
              <div>
                <span className="text-sm font-semibold">
                  Special Instructions:
                </span>
                <p className="text-sm">{order.specialInstructions}</p>
              </div>
            )}
            {order.cancellationReason && (
              <div>
                <span className="text-sm font-semibold">
                  Cancellation Reason:
                </span>
                <p className="text-sm">{order.cancellationReason}</p>
              </div>
            )}
            {order.review && (
              <div>
                <span className="text-sm font-semibold">Review:</span>
                <p className="text-sm">{order.review}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col items-center space-y-4 max-w-sm mx-auto">
        <Separator className="w-full" />
        <Link className="w-full" to="/">
          <Button className="w-full" variant="default">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};

export const OrderSummarySkeleton = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            <Skeleton className="h-6 w-1/3" />
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardHeader>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/3">Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(3)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="w-2/3">
                    <Skeleton className="h-4 w-1/3" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-1/4" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-1/4" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col items-center space-y-4 max-w-sm mx-auto">
        <Separator className="w-full" />
        <Link className="w-full" to="/">
          <Button className="w-full" variant="default">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderSummary;
