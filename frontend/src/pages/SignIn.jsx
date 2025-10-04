
import { Link } from "react-router-dom";

export default function SignIn() {
    return (
        <div className="auth-container">
            <div className="auth-form">
                <h1>Đăng nhập</h1>
                <form>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu:</label>
                        <input type="password" id="password" name="password" required />
                    </div>
                    <button type="submit" className="btn">Đăng nhập</button>
                </form>
                <div className="link-text">
                    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </div>
            </div>
        </div>
    );
}