import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InputField } from "../components/InputField";
import LoginBackground from "../components/LoginBackground";
import LoginForm from "../components/LoginForm";
import Toast from "../components/Toast";
import { register } from "../services/authService";
import "../style/Register.scss";

export default function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    phone: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  // handle input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // submit register
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.username || !formData.password) {
      Toast.warning("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      await register(formData);

      Toast.success("Register successfully! Please sign in");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      Toast.error(err.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginBackground>
      <LoginForm
        title="Sign up"
        action={loading ? "Signing up..." : "Sign up"}
        onSubmit={handleRegister}
        loading={loading}
        formFields={
          <>
            <InputField
              name="email"
              label="Enter your email address"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />

              <InputField
                name="username"
                label="Enter your password"
                type="text"
                placeholder="Enter your password"
                value={formData.username}
                onChange={handleChange}
              />

            <InputField
              name="password"
              label="Confirm password"
              type="password"
              placeholder="Confirm password"
              value={formData.password}
              onChange={handleChange}
            />
          </>
        }
        footerContent={
          <div className="link-text d-flex flex-column align-items-start">
            Have an Account ?
            <Link to="/" className="register">
              <div>Sign in</div>
            </Link>
          </div>
        }
      />
    </LoginBackground>
  );
}
