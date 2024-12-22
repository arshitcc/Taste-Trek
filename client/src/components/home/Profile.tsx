import { useState, useRef, FormEvent } from "react";
import { useUserStore } from "@/store/useUserStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trash2 } from "lucide-react";
import { IUser, IAddress } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function EnhancedProfile() {
  const {
    user,
    updateProfile,
    updatePassword,
    updateAvatar,
    addNewAddress,
    removeAddress,
  } = useUserStore();

  const [profileData, setProfileData] = useState<
    Pick<IUser, "fullname" | "email" | "username" | "phone">
  >({
    fullname: user?.fullname || "",
    email: user?.email || "",
    username: user?.username || "",
    phone: user?.phone || "",
  });

  const { toast } = useToast();

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [newAddress, setNewAddress] = useState<IAddress>({
    street: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);
      await updateAvatar(formData);
      toast({
        title: "Profile Picture Updated",
        description: "Your Profile Picture has been updated successfully",
      });
    }
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await updateProfile(profileData);
    setIsLoading(false);
    toast({
      title: "Profile Information Updated",
      description: "Your profile has been updated successfully",
    });
  };

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await updatePassword(passwordData);
    setIsLoading(false);
    setPasswordData({ oldPassword: "", newPassword: "" });
    toast({
      title: "Password Updated",
      description: "Your password has been updated successfully",
    });
  };

  const handleAddAddress = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await addNewAddress(newAddress);
    setIsLoading(false);
    setNewAddress({
      street: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
    });
    toast({
      title: "Address Added",
      description: "Your address has been added successfully",
    });
  };

  return (
    <div className="container mx-auto py-10 p-2">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar
                    className="w-20 h-20 cursor-pointer"
                    onClick={() => imageRef.current?.click()}
                  >
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>
                      {user?.fullname?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    ref={imageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => imageRef.current?.click()}
                  >
                    Change Avatar
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input
                      id="fullname"
                      name="fullname"
                      value={profileData.fullname}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={profileData.username}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Current Password</Label>
                  <Input
                    id="oldPassword"
                    name="oldPassword"
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Manage Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user?.addresses?.map((address, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p>{address.street}</p>
                            <p>
                              {address.city}, {address.country}
                            </p>
                            <p>{address.pincode}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              removeAddress(address._id!);
                              toast({
                                title: "Address Deleted",
                                description:
                                  "Your address has been deleted successfully",
                                variant: "destructive",
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street</Label>
                      <Input
                        id="street"
                        name="street"
                        value={newAddress.street}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={newAddress.city}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={newAddress.state}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={newAddress.country}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Postal Code</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={newAddress.pincode}
                        onChange={handleAddressChange}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Add New Address
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="restaurant">
          <Card>
            <CardHeader>
              <CardTitle>Launch Your Restaurant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Want to start your own restaurant? Launch your culinary journey
                today!
              </p>
              <Link to="/admin/new-restaurant">
                <Button>Launch Your Restaurant</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
