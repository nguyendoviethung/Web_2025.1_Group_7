import { Layout } from "antd";
import ReaderSidebar from "../../components/ReaderSidebar";
import { Outlet } from "react-router-dom";
 
const { Content } = Layout;
 
export default function ReaderOutlet() {
  return (
    <div className="d-flex">
      <ReaderSidebar />
      <Layout>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </div>
  );
}