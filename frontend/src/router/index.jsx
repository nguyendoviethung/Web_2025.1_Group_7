import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import BooksPage from "../pages/BooksPage";
import AuthorsPage from "../pages/AuthorsPage";

const router = createBrowserRouter([
    // --- Auth routes (Đăng nhập / Đăng ký) ---
    {
        path: "/",
        element: <div>Sign In Page (Coming Soon)</div>,
    },
    {
        path: "/register",
        element: <div>Register Page (Coming Soon)</div>,
    },

    // --- Admin routes ---
    {
        path: "/admin",
        element: <AdminLayout />,
        children: [
            {
                path: "dashboard",
                element: (
                    <div style={{ padding: 24 }}>
                        Dashboard Page (Coming Soon)
                    </div>
                ),
            },
            {
                path: "books",
                element: <BooksPage />,
            },
            {
                path: "book-copies",
                element: (
                    <div style={{ padding: 24 }}>
                        Book Copies Page (Coming Soon)
                    </div>
                ),
            },
            {
                path: "authors",
                element: <AuthorsPage />,
            },
            {
                path: "categories",
                element: (
                    <div style={{ padding: 24 }}>
                        Categories Page (Coming Soon)
                    </div>
                ),
            },
            {
                path: "members",
                element: (
                    <div style={{ padding: 24 }}>
                        Members Page (Coming Soon)
                    </div>
                ),
            },
            {
                path: "staff",
                element: (
                    <div style={{ padding: 24 }}>Staff Page (Coming Soon)</div>
                ),
            },
            {
                path: "loans",
                element: (
                    <div style={{ padding: 24 }}>Loans Page (Coming Soon)</div>
                ),
            },
            {
                path: "reservations",
                element: (
                    <div style={{ padding: 24 }}>
                        Reservations Page (Coming Soon)
                    </div>
                ),
            },
            {
                path: "fines",
                element: (
                    <div style={{ padding: 24 }}>Fines Page (Coming Soon)</div>
                ),
            },
            {
                path: "reviews",
                element: (
                    <div style={{ padding: 24 }}>
                        Reviews Page (Coming Soon)
                    </div>
                ),
            },
            {
                path: "activity-logs",
                element: (
                    <div style={{ padding: 24 }}>
                        Activity Logs Page (Coming Soon)
                    </div>
                ),
            },
        ],
    },

    // ---Reader routes---
]);

export default router;
