import React from "react";
import { Table, Button, Space, Tag, Card } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function BookTable({ books, onEdit, onDelete }) {
    const navigate = useNavigate();

    const columns = [
        {
            title: "Book ID",
            dataIndex: "BookId",
            key: "BookId",
            width: 100,
            render: (id) => `#${id}`,
        },
        {
            title: "ISBN",
            dataIndex: "ISBN",
            key: "ISBN",
            width: 150,
            render: (isbn) => <code style={{ fontSize: 12 }}>{isbn}</code>,
        },
        {
            title: "Title",
            dataIndex: "Title",
            key: "Title",
            width: 250,
        },
        {
            title: "Publisher",
            dataIndex: "PublisherName",
            key: "PublisherName",
            width: 180,
        },
        {
            title: "Year",
            dataIndex: "PublicationYear",
            key: "PublicationYear",
            width: 100,
        },
        {
            title: "Edition",
            dataIndex: "Edition",
            key: "Edition",
            width: 120,
        },
        {
            title: "Language",
            dataIndex: "Language",
            key: "Language",
            width: 120,
            render: (language) => <Tag color="blue">{language}</Tag>,
        },
        {
            title: "Pages",
            dataIndex: "Pages",
            key: "Pages",
            width: 100,
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() =>
                            navigate(`/admin/books/${record.BookId}`)
                        }
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete(record.BookId)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <Table
                columns={columns}
                dataSource={books}
                rowKey="BookId"
                scroll={{ x: 1200 }}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} books`,
                }}
            />
        </Card>
    );
}
