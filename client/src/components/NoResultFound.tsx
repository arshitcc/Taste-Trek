import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export const NoResultFound = ({
    searchCollection,
    searchText,
    message,
    className,
  }: {
    searchCollection?: string;
    searchText?: string;
    message?: string;
    className?: string;
  }) => {
    return (
      <div className={`text-center w-full py-8 ${className}`}>
        <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
          No results found
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          We couldn't find any {searchCollection}{" "}
          {searchText && `for ${searchText}`}. <br /> {message}
        </p>
        <Link to="/">
          <Button className="mt-4">Go Back to Home</Button>
        </Link>
      </div>
    );
  };