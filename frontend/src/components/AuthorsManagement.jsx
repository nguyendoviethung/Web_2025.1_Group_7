import React, { useState } from "react";
import { Button, message, Form, Input, DatePicker } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { mockAuthors } from "../data/mockData";
import {
    PageContainer,
    PageHeader,
    SearchCard,
    DataTable,
    ActionButtons,
    FormModal,
    confirmDelete,
} from "./common";

const { TextArea } = Input;

export default function AuthorsManagement({ onNavigate }) {
    const [authors, setAuthors] = useState(mockAuthors);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState(null);

    // Filter authors
    const filteredAuthors = authors.filter(
        (author) =>
            author.FullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            author.Nationality.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Table columns
    const columns = [
        {
            title: "Author ID",
            dataIndex: "AuthorId",
            key: "AuthorId",
            render: (id) => `#${id}`,
            width: 100,
        },
        {
            title: "Full Name",
            dataIndex: "FullName",
            key: "FullName",
            sorter: (a, b) => a.FullName.localeCompare(b.FullName),
            width: 250,
        },
        {
            title: "Nationality",
            dataIndex: "Nationality",
            key: "Nationality",
            sorter: (a, b) => a.Nationality.localeCompare(b.Nationality),
            width: 180,
        },
        {
            title: "Date of Birth",
            dataIndex: "DateOfBirth",
            key: "DateOfBirth",
            width: 150,
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",
            align: "right",
            width: 150,
            render: (_, record) => (
                <ActionButtons
                    record={record}
                    onView={() => handleView(record.AuthorId)}
                    onEdit={() => handleEdit(record)}
                    onDelete={() => handleDelete(record.AuthorId)}
                />
            ),
        },
    ];

    // Handle add author
    const handleAdd = () => {
        setEditingAuthor(null);
        setIsModalVisible(true);
    };

    const handleAddSubmit = (values) => {
        const newAuthor = {
            AuthorId: Math.max(...authors.map((a) => a.AuthorId)) + 1,
            FullName: values.fullName,
            Nationality: values.nationality,
            DateOfBirth: values.dateOfBirth
                ? values.dateOfBirth.format("YYYY-MM-DD")
                : "",
            Biography: values.biography || "",
        };
        setAuthors([...authors, newAuthor]);
        setIsModalVisible(false);
        message.success("Author added successfully!");
    };

    // Handle edit author
    const handleEdit = (author) => {
        setEditingAuthor(author);
        setIsModalVisible(true);
    };

    const handleEditSubmit = (values) => {
        const updatedAuthors = authors.map((author) =>
            author.AuthorId === editingAuthor.AuthorId
                ? {
                      ...author,
                      FullName: values.fullName,
                      Nationality: values.nationality,
                      DateOfBirth: values.dateOfBirth
                          ? values.dateOfBirth.format("YYYY-MM-DD")
                          : author.DateOfBirth,
                      Biography: values.biography || "",
                  }
                : author
        );
        setAuthors(updatedAuthors);
        setIsModalVisible(false);
        setEditingAuthor(null);
        message.success("Author updated successfully!");
    };

    // Handle view author
    const handleView = (authorId) => {
        if (onNavigate) {
            onNavigate("author-detail", authorId);
        }
    };

    // Handle delete author
    const handleDelete = (authorId) => {
        confirmDelete({
            title: "Delete Author",
            content: "Are you sure you want to delete this author?",
            onConfirm: () => {
                setAuthors(
                    authors.filter((author) => author.AuthorId !== authorId)
                );
            },
            successMessage: "Author deleted successfully!",
        });
    };

    // Handle form submit
    const handleFormSubmit = (values) => {
        if (editingAuthor) {
            handleEditSubmit(values);
        } else {
            handleAddSubmit(values);
        }
    };

    // Get initial values for edit mode
    const getInitialValues = () => {
        if (!editingAuthor) return {};
        return {
            fullName: editingAuthor.FullName,
            nationality: editingAuthor.Nationality,
            biography: editingAuthor.Biography,
        };
    };

    return (
        <PageContainer>
            <PageHeader
                title="Authors Management"
                description="Manage library authors"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        size="large"
                    >
                        Add Author
                    </Button>
                }
            />

            <SearchCard
                placeholder="Search by name or nationality..."
                value={searchQuery}
                onChange={setSearchQuery}
            />

            <DataTable
                columns={columns}
                dataSource={filteredAuthors}
                rowKey="AuthorId"
            />

            <FormModal
                visible={isModalVisible}
                title={editingAuthor ? "Edit Author" : "Add New Author"}
                editMode={!!editingAuthor}
                initialValues={getInitialValues()}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingAuthor(null);
                }}
                width={600}
            >
                <Form.Item
                    label="Full Name"
                    name="fullName"
                    rules={[
                        { required: true, message: "Please enter author name" },
                    ]}
                >
                    <Input placeholder="Enter author full name" />
                </Form.Item>

                <Form.Item
                    label="Nationality"
                    name="nationality"
                    rules={[
                        { required: true, message: "Please enter nationality" },
                    ]}
                >
                    <Input placeholder="Enter nationality" />
                </Form.Item>

                {!editingAuthor && (
                    <Form.Item
                        label="Date of Birth"
                        name="dateOfBirth"
                        rules={[
                            {
                                required: true,
                                message: "Please select date of birth",
                            },
                        ]}
                    >
                        <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                )}

                <Form.Item label="Biography" name="biography">
                    <TextArea
                        rows={4}
                        placeholder="Enter author biography (optional)"
                    />
                </Form.Item>
            </FormModal>
        </PageContainer>
    );
}
