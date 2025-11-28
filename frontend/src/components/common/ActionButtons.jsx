import React from "react";
import { Space, Button } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

export function ActionButtons({
    onView,
    onEdit,
    onDelete,
    showView = true,
    showEdit = true,
    showDelete = true,
    record,
}) {
    return (
        <Space size="small">
            {showView && onView && (
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => onView(record)}
                />
            )}
            {showEdit && onEdit && (
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(record)}
                />
            )}
            {showDelete && onDelete && (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(record)}
                />
            )}
        </Space>
    );
}
