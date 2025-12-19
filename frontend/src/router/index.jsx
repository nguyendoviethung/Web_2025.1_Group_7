import { createBrowserRouter } from "react-router-dom";
import SignIn from "../pages/SignIn";
import Register from "../pages/Register";
import Dashboard from "../pages/admin/Dashboard";
import BookManagement from "../pages/admin/BookManagement";
import ReaderManagement from "../pages/admin/ReaderManagement";
import AdminOutlet from "../pages/admin/AdminOutlet";
import BorrowBooks from "../pages/admin/BorrowBook";
import Messages from "../pages/admin/Messages";
import Setting from "../pages/admin/Setting";
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
      { path: "books", element: <BookManagement /> },
      { path: "readers", element: <ReaderManagement /> },
      { path: "borrow-books", element: <BorrowBooks /> },
      { path: "messages", element: <Messages /> },
      { path: "settings", element: <Setting /> },
      // có thể thêm các trang khác 
    ],
  },

  // ---Reader routes---  


]);

export default router;