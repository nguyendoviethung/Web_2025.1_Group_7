import { Link } from "react-router-dom";
import "../style/SignIn.scss";
import Google from "../assets/Google.png";
import Apple from "../assets/Apple.png";
import Facebook from "../assets/Facebook.png";
import LoginForm from "../components/LoginForm";
import LoginBackground from "../components/LoginBackground";
import { InputField } from "../components/InputField";  
import { useNavigate } from "react-router-dom";

export default function SignIn() {
const navigate = useNavigate();
const handleSignIn = () => {
  navigate("/admin/dashboard");
}
  return (
    <LoginBackground>
      <LoginForm 
        title="Sign in"
        action="Sign In"
        onClick = {handleSignIn}
        children_1 = {
          <>
            <div className="d-flex justify-content-start align-items-center gap-3 mb-5"> 
              <Link to="/" className="google-signin">
                <img src={Google} alt="Google Logo" className="social-logo" />
                Sign in with Google
              </Link>
              
              <button className="logo-wrapper">
                <img src={Facebook} alt="Facebook logo" className="social-logo"/>
              </button>
              
              <button className="logo-wrapper">
                <img src={Apple} alt="Apple logo" className="social-logo"/>
              </button>
            </div>
            <InputField
              name="username"
              label="Enter your username"
              type="email"
              placeholder="Enter your username"
              value=""
              onChange={() => {}}
            />
          </>
        }

      children_2 = {
          <div className="forgot-password">
            <Link to = "/" className = "link-forgot-password">Forgot your password?</Link>
          </div>
        }

      children_3 = {
          <div className="link-text d-flex flex-column align-items-start">
              No Account? 
            <Link to="/register" className = "register">
              <div className = "register">
                 Sign up
              </div>
            </Link>
          </div>
        }
      />
    </LoginBackground>
  );
}