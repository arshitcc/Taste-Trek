import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { IAppliedFilters } from "@/types/restaurant";

type FilterCardProps = {
  applicableFilters: IAppliedFilters;
  appliedFilter: IAppliedFilters;
  setAppliedFilter: React.Dispatch<React.SetStateAction<IAppliedFilters>>;
};

const ApplicableFilters = ({
  applicableFilters,
  appliedFilter,
  setAppliedFilter,
}: FilterCardProps) => {
  const handleAvgCostChange = (value: number[]) => {
    setAppliedFilter((prev) => ({ ...prev, avgCost: value[0] }));
  };

  const handleRatingChange = (value: number[]) => {
    setAppliedFilter((prev) => ({ ...prev, rating: value[0] }));
  };

  const handleFeaturedChange = (checked: boolean) => {
    setAppliedFilter((prev) => ({ ...prev, isFeatured: checked }));
  };

  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    setAppliedFilter((prev) => ({
      ...prev,
      cuisines: checked
        ? [...(prev.cuisines ?? []), cuisine]
        : prev.cuisines?.filter((c) => c !== cuisine),
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="avg-cost">
            Average Cost: {appliedFilter.avgCost}
          </Label>
          <Slider
            id="avg-cost"
            min={0}
            max={10000}
            step={1}
            value={[Number(appliedFilter.avgCost)]}
            onValueChange={handleAvgCostChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Rating: {appliedFilter.rating}</Label>
          <Slider
            id="rating"
            min={0}
            max={5}
            step={1}
            value={[Number(appliedFilter.rating)]}
            onValueChange={handleRatingChange}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="featured"
            checked={appliedFilter.isFeatured}
            onCheckedChange={handleFeaturedChange}
          />
          <Label htmlFor="featured">Featured</Label>
        </div>

        <div className="space-y-2">
          <Label>Cuisines</Label>
          {applicableFilters?.cuisines?.map((cuisine) => (
            <div key={cuisine} className="flex items-center space-x-2">
              <Checkbox
                id={`cuisine-${cuisine}`}
                checked={appliedFilter?.cuisines?.includes(cuisine)}
                onCheckedChange={(checked) =>
                  handleCuisineChange(cuisine, checked as boolean)
                }
              />
              <Label htmlFor={`cuisine-${cuisine}`}>{cuisine}</Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicableFilters;
