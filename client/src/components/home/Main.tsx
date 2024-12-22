import { useState } from "react";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const Main = () => {
  const [searchText, setSearchText] = useState<string>("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!searchText.trim()) return;
    navigate(`/search/${searchText}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 items-center max-w-7xl mx-auto p-8 rounded-lg m-4 gap-20">
      <div className="flex flex-col gap-10 md:w-full">
        <div className="flex flex-col gap-5">
          <h1 className="font-bold md:font-extrabold md:text-5xl text-4xl">
            Order Food anytime & anywhere
          </h1>
          <p className="text-gray-500">
            Hey! Our Delicios food is waiting for you, we are always near to
            you.
          </p>
        </div>
        <div className="relative flex items-center gap-2">
          <Input
            type="text"
            value={searchText}
            placeholder="Search restaurant by name, city & country"
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10 shadow-lg"
          />
          <Search className="text-gray-500 absolute inset-y-1 left-2" />
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>
      <div>
        <img
          src="https://images.pexels.com/photos/674574/pexels-photo-674574.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="A"
          className="object-cover w-full max-h-[500px] rounded-xl"
        />
      </div>
    </div>
  );
};

export default Main;
