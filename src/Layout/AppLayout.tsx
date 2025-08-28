import Footer from "@/pages/Shared/Footer/Footer";
import Navbar from "@/pages/Shared/Navbar/Navbar";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="min-h-dvh grid grid-rows-[auto_1fr_auto]">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
