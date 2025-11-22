import { Home, ShoppingCart, History, Receipt } from "lucide-react";
import { NavLink } from "react-router-dom";

const BottomNav = () => {
  const navItems = [
    { to: "/", icon: Home, label: "เมนู" },
    { to: "/cart", icon: ShoppingCart, label: "ตะกร้า" },
    { to: "/history", icon: History, label: "ประวัติ" },
    { to: "/receipt", icon: Receipt, label: "ใบเสร็จ" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 pb-safe">
      <div className="container max-w-6xl mx-auto px-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 px-4 min-w-[70px] transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} />
                  <span className="text-xs font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;