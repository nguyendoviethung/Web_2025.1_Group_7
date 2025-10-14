import { menuItemsAdmin } from "../utils/MenuItems";
import { Link } from "react-router-dom";
import logo from "../assets/LibraryLogo.svg";
import avatar from "../assets/Avatar.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logout from "../assets/Logout.svg";
import "../style/Sidebar.scss";

export default function Sidebar() {
  return (
    <div className="sidebar">
            <img src={logo} alt="Logo"className="logo"/>

    <div className ="d-flex flex-column align-items-start gap-4 menu-items">
      {menuItemsAdmin.map((item, index) => (
        <Link key={index} to={item.link} className="item-icon-main d-flex d-block ">
            <FontAwesomeIcon icon={item.icon} className="mr-2 item-icon" />
            <span className="item-title d-block">{item.title}</span>
        </Link>
      ))}
    </div>

      <div className="d-flex gap-5 align-items-center ">
        <img src={avatar} alt="Avatar"  className = "d-block"/>
        <img src={logout} alt="Logout" className = "d-block item-icon" style={{height: "22px" , width : "auto"}}/>
      </div>

    </div>
  );
}
