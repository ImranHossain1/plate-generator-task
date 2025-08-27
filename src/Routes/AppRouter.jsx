import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../Layout/AppLayout";
import Home from "../pages/Home/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
