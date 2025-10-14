import "../style/LoginBackground.scss";
import logo from "../assets/LibraryLogo.svg";

export default function LoginBackground({ children }) {
  return (
    <div className="signin-container">
      <div className="logo">
        <img src={logo} alt="Logo" />
      </div>
        {children}
    </div>
  );
}
