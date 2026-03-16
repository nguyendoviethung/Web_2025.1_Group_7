import { Layout } from "antd";
import Sidebar from "../../components/Sidebar";
import { Outlet } from "react-router-dom";

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
