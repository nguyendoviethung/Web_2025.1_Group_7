
import { Link } from "react-router-dom";

export default function Register() {
    return (
        <div className="auth-container">
            <div className="auth-form">
                <h1>Đăng ký</h1>
                <form>
                    <div className="form-group">
                        <label htmlFor="fullName">Họ và tên:</label>
                        <input type="text" id="fullName" name="fullName" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu:</label>
                        <input type="password" id="password" name="password" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu:</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required />
                    </div>
                    <button type="submit" className="btn">Đăng ký</button>
                </form>
                <div className="link-text">
                    Đã có tài khoản? <Link to="/">Đăng nhập ngay</Link>
                </div>
            </div>
        </div>
    );
}