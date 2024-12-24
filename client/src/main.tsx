import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Login from "./components/auth/Login.tsx";
import Signup from "./components/auth/Signup.tsx";
import Home from "./components/home/Home.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Profile from "./components/home/Profile.tsx";
import ContactPage from "./components/home/Contact.tsx";
import { useUserStore } from "./store/useUserStore.ts";
import { Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster.tsx";
import SearchPage from "./components/user/SearchPage.tsx";
import RestaurantPage from "./components/user/RestaurantPage.tsx";

const AuthenticatedUser = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useUserStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <AuthenticatedUser>
          <App />
        </AuthenticatedUser>
        <Toaster />
      </>
    ),
    children: [
      {
        path: "/",
        element : <Home/>
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/search/:searchText",
        element: <SearchPage/>,
      },
      {
        path: "/restaurant/:restaurantId",
        element: <RestaurantPage/>,
      },
      {
        path: "/carts",
        element: <h1>Carts</h1>,
      },
      {
        path: "/cart/:restaurantId",
        element: <h1>Cart</h1>,
      },
      {
        path: "/orders",
        element: <h1>OrdersPage</h1>,
      },
      {
        path: "/orders/:orderId",
        element: <h1>OrderSummary</h1>,
      },
      {
        path: "/admin/new-restaurant",
        element: <h1>CreateRestaurant</h1>,
      },
      {
        path: "/admin/dashboard",
        element: <h1>AdminDashboard</h1>,
      },
      {
        path: "/contact",
        element: <ContactPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={appRouter} />
);
