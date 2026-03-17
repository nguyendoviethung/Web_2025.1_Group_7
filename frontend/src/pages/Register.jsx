import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InputField } from "../components/InputField";
import LoginBackground from "../components/LoginBackground";
import LoginForm from "../components/LoginForm";
import { useToast } from "../components/Toast";
import { register } from "../services/authService";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import "../style/Register.scss";

export default function Register() {
  const navigate   = useNavigate();
  const toast      = useToast();
  const studentRef = useRef(null);
  const passRef    = useRef(null);
  const confirmRef = useRef(null);

  const [formData, setFormData] = useState({
    full_name:       "",
    student_id:      "",
    password:        "",
    confirmPassword: "",
  });

  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading,             setLoading]             = useState(false);

  const generatedEmail =
    formData.full_name && formData.student_id
      ? `${formData.full_name.trim().toLowerCase().replace(/\s+/g, "")}${formData.student_id.trim()}@datn.edu.vn`
      : "";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleKeyDown = (nextRef) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };

  const validate = () => {
    const { full_name, student_id, password, confirmPassword } = formData;
    if (!full_name.trim()) {
      toast.warning("Please enter your full name");
      return false;
    }
    if (!student_id.trim()) {
      toast.warning("Please enter your student ID");
      return false;
    }
    if (!password) {
      toast.warning("Please enter your password");
      return false;
    }
    if (password.length < 6) {
      toast.warning("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      await register({
        full_name:  formData.full_name.trim(),
        student_id: formData.student_id.trim(),
        email:      generatedEmail,
        password:   formData.password,
      });
      toast.success("Register successful! Please sign in");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      toast.error(err.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  const isMatch  = formData.password === formData.confirmPassword;
  const hasTyped = formData.confirmPassword.length > 0;

  return (
    <LoginBackground>
      <LoginForm
        title="Sign up"
        tall={true}
        action={loading ? "Signing up..." : "Sign up"}
        onSubmit={handleRegister}
        loading={loading}
        formFields={
          <>

            {/* ── Hàng 1: Full Name ── */}
            <InputField
              name="full_name"
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={handleChange}
              onKeyDown={handleKeyDown(studentRef)}
            />

            {/* ── Hàng 2: Student ID + Email preview ── */}
            <div className="register-row">

              <InputField
                name="student_id"
                label="Student ID"
                type="text"
                placeholder="e.g. 20225848"
                value={formData.student_id}
                onChange={handleChange}
                onKeyDown={handleKeyDown(passRef)}
                inputRef={studentRef}
              />

              <div className="email-preview-group">
                <label className="email-preview-label">
                  Email (auto-generated)
                </label>
                <div className="email-preview">
                  {generatedEmail
                    ? generatedEmail
                    : <span className="email-placeholder">Fill name & ID to generate</span>
                  }
                </div>
              </div>

            </div>

            {/* ── Hàng 3: Password + Confirm Password ── */}
            <div className="register-row register-row--password">

        {/* Password */}
        <div className="password-wrapper">
          <div className="input-with-eye">
            <InputField
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown(confirmRef)}
              inputRef={passRef}
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
        </div>

        {/* Confirm Password */}
        <div className="password-wrapper">
          <div className="input-with-eye">
            <InputField
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              inputRef={confirmRef}
            />
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
          </div>
        </div>

      </div>

      {/* ── Thông báo khớp mật khẩu  */}
      <span
        className={`password-match ${isMatch ? "match" : "no-match"}`}
        style={{ visibility: hasTyped ? "visible" : "hidden" }}
      >
        {isMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
      </span>

          </>
        }
        footerContent={
          <div className="link-text d-flex flex-column align-items-start">
            Have an Account?
            <Link to="/" className="register">Sign in</Link>
          </div>
        }
      />
    </LoginBackground>
  );
}