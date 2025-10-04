import { Outlet, Link } from "react-router-dom";

function AdminOutlet() {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2>📚 Quản lý thư viện</h2>
        <ul>
          <li><Link to="/admin/dashboard">Dashboard</Link></li>
          <li><Link to="/admin/book">Quản lý Sách</Link></li>
          <li><Link to="/admin/reader">Quản lý Độc giả</Link></li>
        </ul>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminOutlet;
