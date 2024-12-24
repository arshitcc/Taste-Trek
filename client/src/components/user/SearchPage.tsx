import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Globe,
  MapPin,
  RotateCcwIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardFooter } from "../ui/card";
import { AspectRatio } from "../ui/aspect-ratio";
import { Skeleton } from "../ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../ui/dropdown-menu";
import { NoResultFound } from "../NoResultFound";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { IAppliedFilters } from "@/types/restaurant";
import ApplicableFilters from "../ApplicableFilters";

const SearchPage = () => {
  const params = useParams();
  const [searchText, setSearchText] = useState(params.searchText!);
  const {
    isLoading,
    searchedRestaurants,
    applicableFilters,
    setAppliedFilters,
    resetAppliedFilters,
    getQueryRestaurants,
  } = useRestaurantStore();

  const [appliedFilter, setAppliedFilter] = useState<IAppliedFilters>(
    {} as IAppliedFilters
  );

  useEffect(() => {
    setAppliedFilters(appliedFilter);
    getQueryRestaurants(params.searchText!, appliedFilter);
  }, [params.searchText!, appliedFilter]);

  const [isDropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setDropdownOpen(false);
      }
    };
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  return (
    <div className="max-w-7xl mx-auto my-10">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={searchText}
          placeholder="Search by restaurant & cuisines"
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button onClick={() => getQueryRestaurants(searchText!, appliedFilter)}>
          Search
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-6 ">
        <div className="col-span-1 p-1 md:p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="m-1 md:m-3 font-semibold">Filter Section</h1>
              <Button variant="link" onClick={resetAppliedFilters}>
                <RotateCcwIcon />
              </Button>
            </div>
            <div className="flex md:hidden">
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <SlidersHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[80vw] p-3 bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
                  <div className="flex flex-col gap-2 mt-4 flex-wrap">
                    <ApplicableFilters
                      applicableFilters={applicableFilters}
                      appliedFilter={appliedFilter}
                      setAppliedFilter={setAppliedFilter}
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="hidden md:flex">
            <Card className="w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
              <ApplicableFilters
                applicableFilters={applicableFilters}
                appliedFilter={appliedFilter}
                setAppliedFilter={setAppliedFilter}
              />
            </Card>
          </div>
        </div>
        <div className="col-span-5 flex-1 p-3">
          <div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2 md:my-3">
              <h1 className="font-medium text-lg">
                ({searchedRestaurants.length}) Search result found
              </h1>
            </div>
            <div
              className={`grid grid-cols-1 md:grid-cols-${
                isLoading || searchedRestaurants.length > 0 ? "3" : "1"
              } gap-4 mt-4`}
            >
              {isLoading ? (
                <SearchPageSkeleton />
              ) : !isLoading && searchedRestaurants?.length === 0 ? (
                <NoResultFound
                  searchText={params.searchText!}
                  searchCollection="Restaurants"
                  message="Kisi Aache City ma raha karo"
                />
              ) : (
                searchedRestaurants?.map((restaurant) => (
                  <Card
                    key={restaurant._id}
                    className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                  >
                    <div className="relative">
                      <AspectRatio ratio={16 / 6}>
                        <img
                          src={restaurant.image}
                          alt="prime_image"
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                      <div className="absolute top-2 left-2 bg-white dark:bg-gray-700 bg-opacity-75 rounded-lg px-3 py-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Featured
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4 flex flex-col items-start justify-around gap-2">
                      <h1 className="text-lg md:text-2xl min-h-20 font-bold text-gray-900 dark:text-gray-100 truncate-2">
                        {restaurant.name}
                      </h1>
                      <div className="gap-1 flex items-center text-gray-600 dark:text-gray-400">
                        <MapPin size={16} />
                        <p className="text-sm">
                          City:{" "}
                          <span className="font-medium">
                            {restaurant.address.city}
                          </span>
                        </p>
                      </div>
                      <div className="gap-1 flex items-center text-gray-600 dark:text-gray-400">
                        <Globe size={16} />
                        <p className="text-sm">
                          Country:{" "}
                          <span className="font-medium">
                            {restaurant.address.country}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {restaurant.cuisine.map(
                          (cuisine: string, idx: number) => (
                            <Badge
                              key={idx}
                              className="font-medium px-2 py-1 rounded-full shadow-sm"
                            >
                              {cuisine}
                            </Badge>
                          )
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t dark:border-t-gray-700 border-t-gray-100 text-white flex justify-end items-center pt-4">
                      <Link to={`/restaurant/${restaurant._id}`}>
                        <Button className="font-semibold py-2 px-4 rounded-full shadow-md transition-colors duration-200">
                          View Menus
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

const SearchPageSkeleton = () => {
  return (
    <>
      {[...Array(3)].map((_, index) => (
        <Card
          key={index}
          className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden"
        >
          <div className="relative">
            <AspectRatio ratio={16 / 6}>
              <Skeleton className="w-full h-full" />
            </AspectRatio>
          </div>
          <CardContent className="p-4">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <div className="mt-2 gap-1 flex items-center text-gray-600 dark:text-gray-400">
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="mt-2 flex gap-1 items-center text-gray-600 dark:text-gray-400">
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
          <CardFooter className="p-4  dark:bg-gray-900 flex justify-end">
            <Skeleton className="h-10 w-24 rounded-full" />
          </CardFooter>
        </Card>
      ))}
    </>
  );
};
