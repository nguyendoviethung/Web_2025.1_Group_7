import { createBrowserRouter } from "react-router-dom";
import SignIn from "../pages/SignIn";
import Register from "../pages/Register";
import Dashboard from "../pages/admin/Dashboard";
import BookManagement from "../pages/admin/BookManagement";
import ReaderManagement from "../pages/admin/ReaderManagement";
import AdminOutlet from "../pages/admin/AdminOutlet";

const router = createBrowserRouter([
  // --- Auth routes (Đăng nhập / Đăng ký) ---
  {
    path: "/",
    element: <SignIn />,
  },
  {
    path: "/register",
    element: <Register />,
  },

  // --- Admin routes ---
  {
    path: "/admin",
    element: <AdminOutlet />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "book", element: <BookManagement /> },
      { path: "reader", element: <ReaderManagement /> },
      // có thể thêm các trang khác 
    ],
  },

  // ---Reader routes---  


]);

export default router;
