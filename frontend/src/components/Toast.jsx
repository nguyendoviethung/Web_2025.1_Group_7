import { message } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  LoadingOutlined
} from "@ant-design/icons";

import "../style/Toast.scss";

// Global config
message.config({
  top: 24,
  duration: 3,
  maxCount: 3
});

const Toast = {
  /* Thành công */
  success(content, duration = 3) {
    message.success({
      content,
      duration,
      icon: <CheckCircleOutlined />,
      className: "custom-toast custom-toast-success"
    });
  },

  /* Lỗi */
  error(content, duration = 3) {
    message.error({
      content,
      duration,
      icon: <CloseCircleOutlined />,
      className: "custom-toast custom-toast-error"
    });
  },

  /* Cảnh báo */
  warning(content, duration = 3) {
    message.warning({
      content,
      duration,
      icon: <ExclamationCircleOutlined />,
      className: "custom-toast custom-toast-warning"
    });
  },

  /* Thông tin */
  info(content, duration = 3) {
    message.info({
      content,
      duration,
      icon: <InfoCircleOutlined />,
      className: "custom-toast custom-toast-info"
    });
  },

  /* Loading – phải tự tắt */
  loading(content = "Processing...") {
    return message.loading({
      content,
      duration: 0,
      icon: <LoadingOutlined />,
      className: "custom-toast custom-toast-loading"
    });
  }
};

export default Toast;
