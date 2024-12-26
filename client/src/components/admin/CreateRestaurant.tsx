import { useState } from "react";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent, 
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createRestaurantSchema, CreateRestaurantSchema } from "@/schemas/admin";
import { useNavigate } from "react-router-dom";

export default function CreateRestaurant() {
  const {createRestaurant} = useRestaurantStore();
  const [restaurant, setRestaurant] = useState<CreateRestaurantSchema>({
    name: "",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      location: {
        latitude: 0,
        longitude: 0,
      },
    },
    phone: "",
    email: "",
    gst: "",
    averageCostForTwo: "500",
    cuisine: []
  });

  const [error, setError] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const navigate = useNavigate();

  const cuisines = [
    "Indian",
    "Mughlai",
    "Chinese",
    "Italian",
    "Mexican",
    "Japanese",
    "Thai",
    "Mediterranean",
    "American",
    "French",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRestaurant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRestaurant((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRestaurant((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        location: {
          ...prev.address.location!,
          [name]: value,
        },
      },
    }));
  };

  const handleCuisineChange = (value: string) => {
    setRestaurant((prev) => ({
      ...prev,
      cuisine: value.split(","),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || "";
    if (file) {
      setImage(file);   
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const result = createRestaurantSchema.safeParse(restaurant);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    if(!image) {
      setError("Image is required");
      return;
    }
    const formData = new FormData();
    formData.append("name", restaurant.name);
    formData.append("description", restaurant.description);
    formData.append("phone", restaurant.phone);
    formData.append("email", restaurant.email);
    formData.append("gst", restaurant.gst);
    formData.append("averageCostForTwo", restaurant.averageCostForTwo.toString());
    formData.append("image", image);
    
    formData.append("address[street]", restaurant.address.street);
    formData.append("address[city]", restaurant.address.city);
    formData.append("address[state]", restaurant.address.state);
    formData.append("address[country]", restaurant.address.country);
    formData.append("address[pincode]", restaurant.address.pincode);
    formData.append("address[location][latitude]", restaurant.address.location!.latitude.toString());
    formData.append("address[location][longitude]", restaurant.address.location!.longitude.toString());

    restaurant.cuisine.forEach(cuisine => formData.append("cuisine[]", cuisine));
    try {
      await createRestaurant(formData);      
      setRestaurant({
        name: "",
        description: "",
        address: {
          street: "",
          city: "",
          state: "",
          country: "",
          pincode: "",
          location: {
            latitude: 0,
            longitude: 0,
          },
        },
        phone: "",
        email: "",
        gst: "",
        averageCostForTwo: "500",
        cuisine: []
      });
      navigate('/');      
    } catch (error) {
      console.error("Failed to create restaurant:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
            {error && <p className="text-red-600 text-center">{error}</p>}
          <CardTitle className="text-2xl md:text-3xl text-center">Create Restaurant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={restaurant.name} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={restaurant.description} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="street">Street</Label>
                <Input id="street" name="street" value={restaurant.address.street} onChange={handleAddressChange} required />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" value={restaurant.address.city} onChange={handleAddressChange} required />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" value={restaurant.address.state} onChange={handleAddressChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" value={restaurant.address.country} onChange={handleAddressChange} required />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" name="pincode" value={restaurant.address.pincode} onChange={handleAddressChange} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={restaurant.phone} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" name="latitude" value={restaurant.address.location.latitude} onChange={handleLocationChange} required />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" name="longitude" value={restaurant.address.location.longitude} onChange={handleLocationChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={restaurant.email} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="gst">GST Number</Label>
                <Input id="gst" name="gst" value={restaurant.gst} onChange={handleInputChange} required />
              </div>
            </div>

            <div>
              <Label htmlFor="averageCostForTwo">Average Cost for Two</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="averageCostForTwo"
                  name="averageCostForTwo"
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={restaurant.averageCostForTwo}
                  onChange={handleInputChange}
                  className="w-full"
                />
                <span className="w-16 text-center">{restaurant.averageCostForTwo}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="cuisine">Cuisine</Label>
              <Select onValueChange={handleCuisineChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisines" />
                </SelectTrigger>
                <SelectContent>
                  {cuisines.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="image">Restaurant Image</Label>
              <Input id="image" name="image" type="file" onChange={handleImageChange} accept="image/*" />
            </div>

            <Button type="submit" className="w-full">Create Restaurant</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
