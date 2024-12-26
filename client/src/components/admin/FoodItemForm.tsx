import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Loader2, Check } from "lucide-react";
import { useFoodStore } from "@/store/useFoodStore";
import { IFood, FoodCategory, SpicyLevel } from "@/types/food";

const tagOptions = [
  "Indian",
  "Mughlai",
  "Ice Cream",
  "Biryani",
  "Bread",
  "Chinese",
  "Italian",
  "Milk",
  "Vegetarian",
  "Non-Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Spicy",
  "Dessert",
  "Beverage",
];

export function FoodItemForm({
  onClose,
  restaurantId,
  foodItem,
  setSelectedFoodItem,
}: {
  onClose: () => void;
  restaurantId: string;
  foodItem?: IFood;
  setSelectedFoodItem: React.Dispatch<React.SetStateAction<IFood | undefined>>;
}) { 
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const { addFoodItemToRestaurant, updateFoodItemDetails } = useFoodStore();
  const [error, setError] = useState("");

  const [foodData, setFoodData] = useState<Pick<IFood, "name" | "description" | "category" | "price" | "preparationTime" | "spicyLevel" | "maxQuantity" | "tags">>({
    name: foodItem?.name || "",
    description: foodItem?.description || "",
    category: foodItem?.category || FoodCategory.MAIN_COURSE,
    price: foodItem?.price || 150,
    preparationTime: foodItem?.preparationTime || 15,
    spicyLevel: foodItem?.spicyLevel || SpicyLevel.MEDIUM,
    maxQuantity: foodItem?.maxQuantity || 20,
    tags: foodItem?.tags || ([] as string[]),
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFoodData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFoodData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || "";
    if (file) {
      setImage(file);
    }
  };

  const handleTagChange = (tag: string) => {
    setFoodData((prev) => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: newTags };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if(foodItem){
      await updateFoodItemDetails(restaurantId, foodItem?._id!,foodData);
      setSelectedFoodItem(undefined);
      onClose();
      return;
    }

    const formData = new FormData();
    formData.append("name", foodData.name);
    formData.append("description", foodData.description);
    formData.append("category", foodData.category);
    formData.append("price", foodData.price.toString());
    if (!foodItem) {
      if (!image) {
        setError("Image is required");
        return;
      }
      formData.append("image", image);
    }
    formData.append("preparationTime", foodData.preparationTime.toString());
    formData.append("spicyLevel", foodData.spicyLevel);
    formData.append("maxQuantity", foodData.maxQuantity.toString());
    foodData.tags.forEach((tag) => formData.append("tags[]", tag));


    try {
      await addFoodItemToRestaurant(restaurantId, formData);
      setSelectedFoodItem(undefined);
      onClose();
    } catch (error) {
      console.error("Error adding food item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          {error && <p className="text-red-600 text-center">{error}</p>}
          <h2 className="text-2xl font-bold">{(foodItem)? "Update Food Item":"Add Food Item"}</h2>
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedFoodItem(undefined);
              onClose();
            }}
          >
            <X />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              value={foodData.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              required
              value={foodData.description}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              name="category"
              value={foodData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starters">Starters</SelectItem>
                <SelectItem value="main course">Main Course</SelectItem>
                <SelectItem value="salads">Salads</SelectItem>
                <SelectItem value="snacks">Snacks</SelectItem>
                <SelectItem value="desserts">Desserts</SelectItem>
                <SelectItem value="beverages">Beverages</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              required
              value={foodData.price}
              onChange={handleInputChange}
            />
          </div>
          {!foodItem && (
            <div>
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                required
                onChange={handleImageChange}
              />
            </div>
          )}
          <div>
            <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
            <Input
              id="preparationTime"
              name="preparationTime"
              type="number"
              required
              value={foodData.preparationTime}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="spicyLevel">Spicy Level</Label>
            <Select
              name="spicyLevel"
              value={foodData.spicyLevel}
              onValueChange={(value) => handleSelectChange("spicyLevel", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select spicy level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sweet">Sweet</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="very high">Hottest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="maxQuantity">Max Quantity</Label>
            <Input
              id="maxQuantity"
              name="maxQuantity"
              type="number"
              required
              value={foodData.maxQuantity}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {tagOptions.map((tag) => (
                <Badge
                  key={tag}
                  variant={foodData.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagChange(tag)}
                >
                  {tag}
                  {foodData.tags.includes(tag) && (
                    <Check className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {(foodItem)? "Updating..." : "Adding..."}
              </>
            ) : foodItem ? (
              "Update Food Item"
            ) : (
              "Add Food Item"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
