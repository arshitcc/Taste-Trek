import { useState, useEffect } from "react";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { useOrderStore } from "@/store/useOrderStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "../ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clock,
  MapPin,
  Star,
  Gift,
  MessageSquare,
  IndianRupeeIcon,
} from "lucide-react";
import { IOrder, OrderStatus } from "@/types/order";
import { useToast } from "@/hooks/use-toast";
import { IRestaurant } from "@/types/restaurant";
import { useFoodStore } from "@/store/useFoodStore";
import { useUserStore } from "@/store/useUserStore";
import { FoodItemForm } from "./FoodItemForm";
import { IFood } from "@/types/food";

export default function AdminDashboard() {
  const { adminRestaurant, getAdminRestaurant, updateRestaurant } =
    useRestaurantStore();
  const { user } = useUserStore();
  const { adminOrders, getRestaurantOrders, updateOrderByRestaurant } =
    useOrderStore();
  const { adminMenu, getRestaurantMenu } = useFoodStore();
  const [activeTab, setActiveTab] = useState("details");
  const [showAddFoodForm, setShowAddFoodForm] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<IFood | undefined>(
    undefined
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>(
    OrderStatus.PENDING
  );

  const { toast } = useToast();

  const [restaurantData, setRestaurantData] = useState<IRestaurant>({
    name: adminRestaurant?.name || "",
    email: adminRestaurant?.email || "",
    phone: adminRestaurant?.phone || "",
    address: {
      street: adminRestaurant?.address?.street || "",
      city: adminRestaurant?.address?.city || "",
      state: adminRestaurant?.address?.state || "",
      country: adminRestaurant?.address?.country || "",
      pincode: adminRestaurant?.address?.pincode || "",
      location: {
        latitude: adminRestaurant?.address?.location?.latitude || 0,
        longitude: adminRestaurant?.address?.location?.longitude || 0,
      },
    },
    image: adminRestaurant?.image || "",
    gst: adminRestaurant?.gst || "",
    cuisine: adminRestaurant?.cuisine || [],
    description: adminRestaurant?.description || "",
    averageCostForTwo: adminRestaurant?.averageCostForTwo || 0,
  });

  useEffect(() => {
    getAdminRestaurant(user?.restaurantId!);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRestaurantData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateRestaurant(restaurantData, adminRestaurant?._id!);
    toast({
      title: "Restaurant Information Updated",
      description: "Your profile has been updated successfully",
    });
  };

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    if (value === "orders") {
      await getRestaurantOrders(adminRestaurant?._id!);
    } else if (value === "menu") {
      await getRestaurantMenu(adminRestaurant?._id!);
    } else if (value === "details") {
      await getAdminRestaurant(adminRestaurant?._id!);
    }
  };

  const handleUpdateOrder = (order: IOrder) => {
    setSelectedOrder(order);
    setNewOrderStatus(order.status!);
    setIsDialogOpen(true);
  };
  console.log(newOrderStatus);

  const handleStatusChange = async () => {
    if (!selectedOrder) return;

    try {
      await updateOrderByRestaurant(
        selectedOrder.restaurantId,
        selectedOrder._id!,
        newOrderStatus
      );
      toast({
        title: "Order Updated",
        description: "The order status has been updated successfully.",
      });
      setIsDialogOpen(false);
      setSelectedOrder(null);
      await getRestaurantOrders(adminRestaurant?._id!);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update the order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Restaurant Dashboard
      </h1>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Restaurant</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="coming-soon">Coming...</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>{restaurantData?.name}</CardTitle>
              <CardDescription>{restaurantData?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateDetails}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Restaurant Name</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={restaurantData?.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        name="description"
                        defaultValue={restaurantData?.description}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="street">Street</Label>
                      <Input
                        id="street"
                        name="address.street"
                        defaultValue={restaurantData?.address?.street}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="address.city"
                        defaultValue={restaurantData?.address?.city}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="address.state"
                        defaultValue={restaurantData?.address?.state}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="address.country"
                        defaultValue={restaurantData?.address?.country}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        name="address.pincode"
                        defaultValue={restaurantData?.address?.pincode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        name="address.location.latitude"
                        defaultValue={
                          restaurantData?.address?.location?.latitude
                        }
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        name="address.location.longitude"
                        defaultValue={
                          restaurantData?.address?.location?.longitude
                        }
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gst">GST Number</Label>
                      <Input
                        id="gst"
                        name="gst"
                        defaultValue={restaurantData?.gst}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={restaurantData?.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={restaurantData?.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cuisine">Cuisine (comma-separated)</Label>
                      <Input
                        id="cuisine"
                        name="cuisine"
                        defaultValue={restaurantData?.cuisine?.join(", ")}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <Button type="submit">Update Details</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adminOrders?.map((order) => (
              <Card key={order._id!}>
                <CardHeader>
                  <CardTitle>Order #{order._id!}</CardTitle>
                  <CardDescription>
                    <Badge>{order.status}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="flex items-center">
                      Total Amount: <IndianRupeeIcon className="h-4 w-4" />
                      {order.totalAmount}
                    </p>
                    <p>
                      Items:{" "}
                      {order.items
                        .map((item) => `${item.name} (x${item.quantity})`)
                        .join(", ")}
                    </p>
                    <p>Payment Method: {order.paymentMethod}</p>
                    <p>Payment Status: {order.paymentStatus}</p>
                    <div className="flex items-center">
                      <Clock className="mr-2" />
                      <span>
                        Estimated Delivery:{" "}
                        {new Date(order.estimatedDeliveryTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2" />
                      <span>
                        Delivery Address:{" "}
                        {`${order.deliveryAddress.street}, ${order.deliveryAddress.city}`}
                      </span>
                    </div>
                    {order.isGift && (
                      <div className="flex items-center">
                        <Gift className="mr-2" />
                        Gift Order
                      </div>
                    )}
                    {order.specialInstructions && (
                      <div className="flex items-center">
                        <MessageSquare className="mr-2" />
                        <span>
                          Special Instructions: {order.specialInstructions}
                        </span>
                      </div>
                    )}
                    {order.rating && (
                      <div className="flex items-center">
                        <Star className="mr-2" />
                        <span>Rating: {order.rating}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (
                        order.status === OrderStatus.PENDING ||
                        order.status === OrderStatus.PREPARING || 
                        order.status === OrderStatus.CONFIRMED
                      ) {
                        handleUpdateOrder(order);
                      }
                    }}
                  >
                    {order.status !== OrderStatus.PENDING &&
                    order.status !== OrderStatus.PREPARING &&
                    order.status !== OrderStatus.CONFIRMED
                      ? "Get Details"
                      : "Update Order"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Order</DialogTitle>
                <DialogDescription>
                  Update the status of order #{selectedOrder?._id}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedOrder?.status === OrderStatus.PENDING && (
                  <>
                    <Button
                      className="bg-green-600 text-white hover:bg-green-700 hover:text-white"
                      variant="outline"
                      onClick={() => setNewOrderStatus(OrderStatus.CONFIRMED)}
                    >
                      Confirm{" "}
                      {newOrderStatus === OrderStatus.CONFIRMED && <Check />}
                    </Button>
                    <Button
                      className="hover:bg-red-800 hover:text-white"
                      variant="destructive"
                      onClick={() => setNewOrderStatus(OrderStatus.CANCELLED)}
                    >
                      Cancel{" "}
                      {newOrderStatus === OrderStatus.CANCELLED && <Check />}
                    </Button>
                  </>
                )}
                {selectedOrder?.status === OrderStatus.CONFIRMED && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => setNewOrderStatus(OrderStatus.PREPARING)}
                    >
                      Preparing {
                        newOrderStatus === OrderStatus.PREPARING && <Check />
                      }
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setNewOrderStatus(OrderStatus.READY_TO_DELIVER)
                      }
                    >
                      Ready to Deliver {
                        newOrderStatus === OrderStatus.READY_TO_DELIVER && <Check />
                      }
                    </Button>
                  </>
                )}
                {selectedOrder?.status === OrderStatus.PREPARING && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setNewOrderStatus(OrderStatus.READY_TO_DELIVER)
                      }
                    >
                      Ready to Deliver {
                        newOrderStatus === OrderStatus.READY_TO_DELIVER && <Check />
                      }
                    </Button>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
                <Button onClick={handleStatusChange}>Update</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="menu">
          <div className="mb-4">
            <Button onClick={() => setShowAddFoodForm(true)}>
              Add Food Item
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {adminMenu?.map((item) => (
              <Card key={item._id}>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="flex items-center">
                      Price: <IndianRupeeIcon className="h-4 w-4" />
                      {item.price}
                    </p>
                    <p>Category: {item.category}</p>
                    <p className="flex items-center">
                      <Clock className="mr-2" />
                      Preparation Time: {item.preparationTime} mins
                    </p>
                    <p>Spicy Level: {item.spicyLevel}</p>
                    <p>Tags: {item.tags?.join(", ")}</p>
                    <Badge variant={item.isAvailable ? "default" : "secondary"}>
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                    <div className="flex items-center">
                      <Star className="mr-2" />
                      <span>
                        Rating: {item.rating} ({item.reviewsCount} reviews)
                      </span>
                    </div>
                    <p>Max Quantity: {item.maxQuantity}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="hover:bg-black hover:text-white hover:transition-500"
                    variant="outline"
                    onClick={() => {
                      setShowAddFoodForm(true);
                      setSelectedFoodItem(item);
                    }}
                  >
                    Get Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {showAddFoodForm && (
            <FoodItemForm
              onClose={() => setShowAddFoodForm(false)}
              restaurantId={adminRestaurant?._id!}
              foodItem={selectedFoodItem}
              setSelectedFoodItem={setSelectedFoodItem}
            />
          )}
        </TabsContent>
        <TabsContent value="coming-soon">
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-center">
                Coming Soon
              </CardTitle>
              <CardDescription className="text-center text-xl">
                Exciting new features are on the way!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="w-64 h-64 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-lg text-center">
                We're working hard to bring you amazing new capabilities. Stay
                tuned!
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
