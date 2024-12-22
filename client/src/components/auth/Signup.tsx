import { useUserStore } from "@/store/useUserStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userSignupSchema, UserSignupSchema } from "@/schemas/user";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const Signup = () => {
  const [userData, setUserData] = useState<UserSignupSchema>({   
    fullname: "",
    email: "",
    phone : "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const [error, setError] = useState("");
  const {isLoading, signup, login} = useUserStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const validationResult = userSignupSchema.safeParse(userData);
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }
    try {
      await signup(userData);
      await login({user : userData.email || userData.phone, password : userData.password});
      navigate("/");
    } catch (error : any) {
      setError(error.message);
    }
  };

  const handleGoogleSignup = async () => {
    window.open(`${import.meta.env.VITE_API_URL}/auth/google/callback`, "_self");
  };

  return (
    <>
      <div className="flex h-screen w-full items-center justify-center px-4">
        <form onSubmit={handleSignup}>
          <Card className="mx-auto max-w-sm my-8">
            <CardHeader>
              {error && <p className="text-red-600 text-center">{error}</p>}

              <CardTitle className="text-xl">Sign Up</CardTitle>
              <CardDescription>
                Enter your information to create an account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Full name *</Label>
                    <Input
                      name="fullname"
                      value={userData.fullname}
                      onChange={handleChange}
                      id="fullname"
                      placeholder="Arshit Chaurasia"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                    id="phone"
                    type="text"
                    placeholder="+91 99000 99000"
                    required
                  />
                </div>
                <Label htmlFor="password">Password *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    className="flex-1"
                    name="password"
                    value={userData.password}
                    onChange={handleChange}
                    id="password"
                    type={`${showPassword ? "text" : "password"}`}
                    required
                  />
                  <Button
                    onClick={togglePasswordVisibility}
                    variant="outline"
                    type="button"
                    size="icon"
                  >
                    {showPassword ? <Eye /> : <EyeOff />}
                  </Button>
                </div>
                <Label htmlFor="password">Confirm Password *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    className="flex-1"
                    name="confirmPassword"
                    value={userData.confirmPassword}
                    onChange={handleChange}
                    id="confirm_password"
                    type={`${showConfirmPassword ? "text" : "password"}`}
                    required
                  />
                  <Button
                    onClick={toggleConfirmPasswordVisibility}
                    variant="outline"
                    type="button"
                    size="icon"
                  >
                    {showConfirmPassword ? <Eye /> : <EyeOff />}
                  </Button>
                </div>
                {isLoading ? (
                  <Button type="submit" className="w-full">
                    <Loader2 className="animate-spin" />
                  </Button>
                ) : (
                  <Button type="submit" className="w-full">
                    Create an account
                  </Button>
                )}

                <Button onClick={handleGoogleSignup} variant="outline" className="w-full">
                  Sign up with Google
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </>
  );
};

export default Signup;
