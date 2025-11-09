import { Layout } from "antd";
import Sidebar from "../../components/Sidebar";
import { Outlet } from "react-router-dom";
import "../../style/AdminOutlet.scss";
const { Content } = Layout;

function AdminOutlet() {
  return (
  <div className="d-flex">
      <Sidebar />
      <Layout>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </div>

  );
}

export default AdminOutlet;
