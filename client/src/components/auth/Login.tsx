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
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { userLoginSchema, UserLoginSchema } from "@/schemas/user";
import { useUserStore } from "@/store/useUserStore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [userData, setUserData] = useState<UserLoginSchema>({
    user: "",
    password: "",
  });

  const [error, setError] = useState("");
  const { isLoading, login } = useUserStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const validationResult = userLoginSchema.safeParse(userData);
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }
    try {
      await login(userData);
      navigate("/");
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    window.open(
      `${import.meta.env.VITE_API_URL}/auth/google/callback`,
      "_self"
    );
  };

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <form onSubmit={handleLogin}>
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            {error && <p className="text-red-600 text-center">{error}</p>}
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your credentials below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="user">User</Label>
                <Input
                  id="user"
                  type="text"
                  placeholder="username or email or phone"
                  name="user"
                  value={userData.user}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative flex ">
                  <Input
                    id="password"
                    type={`${showPassword ? "text" : "password"}`}
                    className="flex-1 mr-2"
                    name="password"
                    value={userData.password}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <Eye /> : <EyeOff />}
                  </Button>
                </div>
              </div>
              {isLoading ? (
                <Button className="w-full">
                  <Loader2 className="animate-spin" />
                </Button>
              ) : (
                <Button type="submit" className="w-full">
                  Login
                </Button>
              )}
              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full"
              >
                Login with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default Login;
