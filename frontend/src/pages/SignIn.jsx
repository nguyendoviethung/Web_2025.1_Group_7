import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/SignIn.scss";
import Google from "../assets/Google.png";
import Apple from "../assets/Apple.png";
import Facebook from "../assets/Facebook.png";
import LoginForm from "../components/LoginForm";
import LoginBackground from "../components/LoginBackground";
import { InputField } from "../components/InputField";
import { login } from "../services/authService";
import Toast from "../components/Toast";
export default function SignIn() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 
  // Xử lí khi nhập liệu vào form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Xử lí khi nhấn nút đăng nhập
  const handleSignIn = async () => {
    try {
      // setLoading(true);
      // setError("");

      // const res = await login(formData);
      // localStorage.setItem("token", res.token);
      // localStorage.setItem("user", JSON.stringify(res.user));

      navigate("/admin/dashboard");

    } catch (err) {
      Toast.error(
      err.message || "Invalid username or password"
    );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginBackground>
      <LoginForm
        title="Sign in"
        action={loading ? "Signing in..." : "Sign In"}
        onSubmit={(e) => {
          e.preventDefault();
           handleSignIn();
        }}
          loading={loading}
           children_1={
          <>
            <div className="d-flex justify-content-start align-items-center gap-3 mb-5">
              <Link to="/" className="google-signin">
                <img src={Google} alt="Google Logo" className="social-logo" />
                Sign in with Google
              </Link>

              <button className="logo-wrapper">
                <img src={Facebook} alt="Facebook logo" className="social-logo" />
              </button>

              <button className="logo-wrapper">
                <img src={Apple} alt="Apple logo" className="social-logo" />
              </button>
            </div>

            <InputField
              name="username"
              label="Enter your username"
              type="email"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
            />

            <InputField
              name="password"
              label="Enter your password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />

            {error && <p className="text-danger mt-2">{error}</p>}
          </>
        }

        children_2={
          <div className="forgot-password">
            <Link to="/" className="link-forgot-password">
              Forgot your password?
            </Link>
          </div>
        }

        children_3={
          <div className="link-text d-flex flex-column align-items-start mr-5">
            No Account ?
            <Link to="/register" className="register">
              <div>Sign up</div>
            </Link>
          </div>
        }
      />
    </LoginBackground>
  );
}
