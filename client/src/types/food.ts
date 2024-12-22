export enum FoodCategory {
    STARTERS = "starters",
    MAIN_COURSE = "main course",
    SALADS = "salads",
    SNACKS = "snacks",
    DESSERTS = "desserts",
    BEVERAGES = "beverages",
  }
  
  export enum SpicyLevel {
    SWEET = "sweet",
    NEUTRAL = "neutral",
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    VERY_HIGH = "very high",
  }
  
  export interface IFood {
    _id?: string;
    name: string;
    description: string;
    category: FoodCategory;
    restaurantId: string;
    price: number;
    image: string;
    preparationTime: number;
    isAvailable: boolean;
    rating: number;
    reviewsCount: number;
    spicyLevel: SpicyLevel;
    tags: string[];
    maxQuantity: number;
  }
  
  export interface IFoodState {
    adminMenu: IFood[];
    isLoading: boolean;
  
    addFoodItemToRestaurant: (restaurantId : string, foodData : FormData) => Promise<void>;
    removeFoodItemFromRestaurant: (restaurantId : string, foodId : string) => Promise<void>;
    getRestaurantMenu: (restaurantId : string) => Promise<void>;
    updateFoodItemDetails: (restaurantId : string, foodId : string, foodData : Partial<IFood>) => Promise<void>;
    updateFoodItemImage: (restaurantId : string, foodId : string, foodImage : File) => Promise<void>;
    toggleFoodAvailability: (restaurantId : string, foodId : string) => Promise<void>;
  }
  