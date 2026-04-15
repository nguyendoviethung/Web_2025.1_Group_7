import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute           from "../components/ProtectedRoute";
import SignIn                   from "../pages/SignIn";
import Register                 from "../pages/Register";
import AdminOutlet              from "../pages/admin/AdminOutlet";
import Dashboard                from "../pages/admin/Dashboard";
import BookManagement           from "../pages/admin/BookManagement";
import ReaderManagement         from "../pages/admin/ReaderManagement";
import BorrowManagement         from "../pages/admin/BorrowManagement";
import AdminChat                from "../pages/admin/AdminChat";
import ReservationManagement    from "../pages/admin/ReservationManagement";
import ReaderOutlet             from "../pages/reader/ReaderOutlet";
import ReaderDashboard          from "../pages/reader/ReaderDashboard";
import BookCatalog              from "../pages/reader/BookCatalog";
import Profile                  from "../pages/reader/Profile";
import ReaderBorrowHistory      from "../pages/reader/ReaderBorrowHistory";
import ReaderChat               from "../pages/reader/ReaderChat";
import ReaderReservations       from "../pages/reader/ReaderReservations";

const router = createBrowserRouter([
  { path: "/",         element: <SignIn /> },
  { path: "/register", element: <Register /> },

  {
    path: "/admin",
    element: <ProtectedRoute allowedRole="staff"><AdminOutlet /></ProtectedRoute>,
    children: [
      { index: true,          element: <Dashboard /> },
      { path: "dashboard",    element: <Dashboard /> },
      { path: "books",        element: <BookManagement /> },
      { path: "readers",      element: <ReaderManagement /> },
      { path: "borrow-books", element: <BorrowManagement /> },
      { path: "reservations", element: <ReservationManagement /> },
      { path: "messages",     element: <AdminChat /> },
    ],
  },

  {
    path: "/reader",
    element: <ProtectedRoute allowedRole="reader"><ReaderOutlet /></ProtectedRoute>,
    children: [
      { index: true,          element: <ReaderDashboard /> },
      { path: "home",         element: <ReaderDashboard /> },
      { path: "books",        element: <BookCatalog /> },
      { path: "reservations", element: <ReaderReservations /> },
      { path: "history",      element: <ReaderBorrowHistory /> },
      { path: "chat",         element: <ReaderChat /> },
      { path: "profile",      element: <Profile /> },
    ],
  },
]);

export default router;