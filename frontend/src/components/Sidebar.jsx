import { menuItemsAdmin } from "../utils/MenuItems";
import { Link } from "react-router-dom";
import logo from "../assets/LibraryLogo.png";
import exit from "../assets/Exit.png";
import avatar from "../assets/Avatar.png";
import "../style/Sidebar.scss";

export default function Sidebar() {
  return (
    <div className="sidebar">
        <div className="logo">
            <img src={logo} alt="Logo" />
        </div>
    <div className ="d-flex flex-column align-items-start gap-4 menu-items">
      {menuItemsAdmin.map((item, index) => (
        <Link key={index} to={item.path} className="item-icon">
            <div className="d-flex align-items-center">
                <div style = {{width: "3.2rem", height: "3.2rem"}}>
             <img src={item.icon} alt={item.title}  />
             </div>
                 <span className = "item-title "> {item.title} </span>
            </div>
        </Link>
      ))}
    </div>
    <div>
        <img src={avatar} alt="Avatar" className = "mb-5" />
    </div>
     <div>
         <img src={exit} alt="Exit" />
    </div>
    </div>
  );
}
