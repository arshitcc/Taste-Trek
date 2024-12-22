import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Loader2, MenuIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const Navbar = () => {
  const [isLoading, setIsLoading] = useState(false);

  const navItems = [
    {
      name: "Home",
      slug: "/",
      active: true,
    },
    {
      name: "Profile",
      slug: "/profile",
      active: false,
    },
    {
      name: "Contact",
      slug: "/contact",
      active: true,
    },
    {
      name: "Orders",
      slug: "/orders",
      active: true,
    },
  ];


  const handleLogout = () => {
    setIsLoading(true);
    setIsLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-2">
      <div className="flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://tailwindcss.com/_next/static/media/tailwindcss-mark.3c5441fc7a190fb1800d4a5c7f07ba4b1345a9c8.svg"
            className="h-6 w-6"
          />
          <span>
            <h1 className="font-bold md:font-extrabold text-xl lg:text-2xl">
              Taste-Trek
            </h1>
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                className="hover:underline underline-offset-4"
                to={item.slug}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/carts" className="relative cursor-pointer">
              <ShoppingCart />
            </Link>
            <div>
              <Avatar>
                <AvatarImage src={""} alt="profilephoto" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              {isLoading ? (
                <Button>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </Button>
              ) : (
                <Button onClick={() => {
                  handleLogout();
                }}>{""}</Button>
              )}
            </div>
          </div>
          <div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle></SheetTitle>
                  <SheetDescription></SheetDescription>
                </SheetHeader>
                <div className="h-full flex flex-col justify-between">
                  <div className="grid p-4">
                    {navItems?.map((item) =>
                      item?.active ? (
                        <Link
                          key={item.name}
                          className="hover:underline underline-offset-4"
                          to={item.slug}
                        >
                          {item.name}
                        </Link>
                      ) : null
                    )}
                  </div>
                  <div className="flex sm:hidden items-center gap-6">
                    {isLoading ? (
                      <Button>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </Button>
                    ) : (
                      <Button onClick={() => {
                        handleLogout();
                      }}>{""}</Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
