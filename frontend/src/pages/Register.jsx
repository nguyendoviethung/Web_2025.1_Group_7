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
        children_1={
          <>
            <InputField
              name="email"
              label="Enter your email address"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />

            <div className="d-flex gap-4">
              <InputField
                name="username"
                label="Enter your username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
              />

              <InputField
                name="phone"
                label="Contact Number"
                type="text"
                placeholder="Contact Number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <InputField
              name="password"
              label="Enter your password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </>
        }
        children_3={
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
