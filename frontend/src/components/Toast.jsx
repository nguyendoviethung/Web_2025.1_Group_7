import { App } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import "../style/Toast.scss";

export function useToast() {
  const { message } = App.useApp();

  return {
    success: (content, duration = 3) =>
      message.success({
        content,
        duration,
        icon: <CheckCircleOutlined />,
        className: "custom-toast custom-toast-success",
      }),

    error: (content, duration = 3) =>
      message.error({
        content,
        duration,
        icon: <CloseCircleOutlined />,
        className: "custom-toast custom-toast-error",
      }),

    warning: (content, duration = 3) =>
      message.warning({
        content,
        duration,
        icon: <ExclamationCircleOutlined />,
        className: "custom-toast custom-toast-warning",
      }),

    info: (content, duration = 3) =>
      message.info({
        content,
        duration,
        icon: <InfoCircleOutlined />,
        className: "custom-toast custom-toast-info",
      }),

    loading: (content = "Processing...") =>
      message.loading({
        content,
        duration: 0,
        icon: <LoadingOutlined />,
        className: "custom-toast custom-toast-loading",
      }),
  };
}

export default { useToast };