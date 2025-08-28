import AppLayout from "@/Layout/AppLayout";
import HomePage from "@/pages/Home/HomePage";
import { createBrowserRouter, Navigate } from "react-router-dom";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
