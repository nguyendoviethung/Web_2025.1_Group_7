import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/SignIn.scss";
import LoginForm from "../components/LoginForm";
import LoginBackground from "../components/LoginBackground";
import { InputField } from "../components/InputField";
import { login } from "../services/authService";
import { useToast } from "../components/Toast";  
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

export default function SignIn() {
  const navigate    = useNavigate();
  const toast       = useToast();               
  const passwordRef = useRef(null);

  const [formData, setFormData]         = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  const handlePasswordKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSignIn();
    }
  };

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) {
      toast.warning("Please enter email and password");  
      return;
    }

    try {
      setLoading(true);
      const res = await login(formData);

      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("user", JSON.stringify(res.user));

      toast.success("Login successful!");          

      setTimeout(() => {
        if (res.user.role === "staff") {
          navigate("/admin/dashboard");
        } else {
          navigate("/reader/home");
        }
      }, 500);

    } catch (err) {
     const errorMessage = err.response?.data?.message || "Incorrect email or password";
     toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginBackground>
      <LoginForm
        title="Sign in"
        action={loading ? "Signing in..." : "Sign In"}
        onSubmit={(e) => { e.preventDefault(); handleSignIn(); }}
        loading={loading}
        formFields={
          <>
            <InputField
              name="email"
              label="Enter your email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={handleEmailKeyDown}
            />
            <div className="password-wrapper">
              <InputField
                name="password"
                label="Enter your password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                inputRef={passwordRef}
                onKeyDown={handlePasswordKeyDown}
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            </div>
          </>
        }
        forgotPassword={
          <div className="forgot-password">
            <Link to="/" className="link-forgot-password">
              Forgot your password?
            </Link>
          </div>
        }
        registerSection={
          <div className="link-text d-flex flex-column align-items-start">
            No Account?
            <Link to="/register" className="register">Sign up</Link>
          </div>
        }
      />
    </LoginBackground>
  );
}