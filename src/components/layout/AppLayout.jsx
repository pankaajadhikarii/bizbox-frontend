import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

const AppLayout = () => {
    return (
        <div className="min-h-screen bg-white text-[#171717]">
            <Navbar />
            <Outlet />
            <Footer />
        </div>
    );
};

export default AppLayout;
