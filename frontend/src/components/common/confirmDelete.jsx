import { Modal, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { confirm } = Modal;

export function confirmDelete({
    title = "Are you sure?",
    content = "This action cannot be undone.",
    onConfirm,
    successMessage = "Deleted successfully!",
}) {
    confirm({
        title,
        icon: <ExclamationCircleOutlined />,
        content,
        okText: "Yes, Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk() {
            onConfirm();
            if (successMessage) {
                message.success(successMessage);
            }
        },
    });
}
