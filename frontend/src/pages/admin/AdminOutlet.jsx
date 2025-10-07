import { Outlet, Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

function AdminOutlet() {
  return (
    <div className="d-flex">
      <Sidebar />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminOutlet;
