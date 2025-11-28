import React, { useState } from "react";
import { Button, message, Form, Input, InputNumber, Select, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { mockBooks } from "../data/mockData";
import {
    PageContainer,
    PageHeader,
    FilterBar,
    DataTable,
    ActionButtons,
    FormModal,
    confirmDelete,
} from "./common";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;

export default function BooksManagement() {
    const navigate = useNavigate();
    const [books, setBooks] = useState(mockBooks);
    const [searchQuery, setSearchQuery] = useState("");
    const [languageFilter, setLanguageFilter] = useState("All");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBook, setEditingBook] = useState(null);

    const languages = ["English", "Spanish", "French", "German", "Chinese"];

    // Filter books
    const filteredBooks = books.filter((book) => {
        const matchesSearch =
            book.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.ISBN.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.PublisherName?.toLowerCase().includes(
                searchQuery.toLowerCase()
            );
        const matchesLanguage =
            languageFilter === "All" || book.Language === languageFilter;
        return matchesSearch && matchesLanguage;
    });

    // Table columns - CÓ CÙNG WIDTH VÀ STRUCTURE VỚI AUTHORS
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
            title: "Language",
            dataIndex: "Language",
            key: "Language",
            width: 120,
            render: (language) => <Tag color="blue">{language}</Tag>,
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
                    onView={() => navigate(`/admin/books/${record.BookId}`)}
                    onEdit={() => handleEdit(record)}
                    onDelete={() => handleDelete(record.BookId)}
                />
            ),
        },
    ];

    // Handlers
    const handleAdd = () => {
        setEditingBook(null);
        setIsModalVisible(true);
    };

    const handleEdit = (book) => {
        setEditingBook(book);
        setIsModalVisible(true);
    };

    const handleDelete = (id) => {
        confirmDelete({
            title: "Delete Book",
            content: "Are you sure you want to delete this book?",
            onConfirm: () => {
                setBooks(books.filter((book) => book.BookId !== id));
            },
            successMessage: "Book deleted successfully!",
        });
    };

    const handleFormSubmit = (values) => {
        if (editingBook) {
            setBooks(
                books.map((book) =>
                    book.BookId === editingBook.BookId
                        ? {
                              ...book,
                              ...values,
                              UpdatedAt: new Date().toISOString(),
                          }
                        : book
                )
            );
            message.success("Book updated successfully!");
        } else {
            const newBook = {
                BookId: books.length + 1,
                ...values,
                CreatedAt: new Date().toISOString(),
            };
            setBooks([...books, newBook]);
            message.success("Book added successfully!");
        }
        setIsModalVisible(false);
        setEditingBook(null);
    };

    return (
        <PageContainer>
            <PageHeader
                title="Books Management"
                description="Manage your library's book catalog"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        size="large"
                    >
                        Add Book
                    </Button>
                }
            />

            <FilterBar
                searchConfig={{
                    placeholder: "Search by title, ISBN, or publisher...",
                    value: searchQuery,
                    onChange: setSearchQuery,
                }}
                selectFilters={[
                    {
                        value: languageFilter,
                        onChange: setLanguageFilter,
                        placeholder: "Select Language",
                        width: 180,
                        options: ["All", ...languages].map((lang) => ({
                            value: lang,
                            label: lang,
                        })),
                    },
                ]}
            />

            <DataTable
                columns={columns}
                dataSource={filteredBooks}
                rowKey="BookId"
            />

            <FormModal
                visible={isModalVisible}
                title={editingBook ? "Edit Book" : "Add New Book"}
                editMode={!!editingBook}
                initialValues={editingBook || {}}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingBook(null);
                }}
                width={800}
            >
                <Form.Item
                    name="Title"
                    label="Title"
                    rules={[
                        { required: true, message: "Please enter book title" },
                    ]}
                >
                    <Input placeholder="Enter book title" />
                </Form.Item>

                <Form.Item
                    name="ISBN"
                    label="ISBN"
                    rules={[{ required: true, message: "Please enter ISBN" }]}
                >
                    <Input placeholder="978-0-XXXX-XXXX-X" />
                </Form.Item>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                    }}
                >
                    <Form.Item name="PublisherName" label="Publisher">
                        <Input placeholder="Publisher name" />
                    </Form.Item>

                    <Form.Item name="PublicationYear" label="Publication Year">
                        <InputNumber
                            style={{ width: "100%" }}
                            min={1000}
                            max={2100}
                        />
                    </Form.Item>

                    <Form.Item name="Language" label="Language">
                        <Select>
                            {languages.map((lang) => (
                                <Select.Option key={lang} value={lang}>
                                    {lang}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="Pages" label="Pages">
                        <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>
                </div>

                <Form.Item name="Description" label="Description">
                    <TextArea rows={4} placeholder="Enter book description" />
                </Form.Item>
            </FormModal>
        </PageContainer>
    );
}
