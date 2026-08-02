import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function Layout() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#070d16" }}>
      <Navbar />
      {/* Padding top ensures the page content isn't hidden 
        behind the fixed navbar (72px height + spacing)
      */}
      <div style={{ paddingTop: "72px" }}>
        <Outlet /> 
      </div>
    </div>
  );
}

export default Layout;