import React, { useState } from "react";
import { Button, message, Modal } from "antd";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { mockBooks } from "../../data/mockData";
import PageHeader from "../common/PageHeader";
import BookFilters from "./BookFilters";
import BookTable from "./BookTable";
import BookFormModal from "./BookFormModal";

const { confirm } = Modal;

export default function BooksManagement({ onNavigate }) {
    const [books, setBooks] = useState(mockBooks);
    const [searchQuery, setSearchQuery] = useState("");
    const [languageFilter, setLanguageFilter] = useState("All");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBook, setEditingBook] = useState(null);

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

    // Handle add book
    const handleAddBook = (values) => {
        const newBook = {
            BookId: books.length + 1,
            ...values,
            PublisherId: books.length + 1,
            CreatedAt: new Date().toISOString(),
            UpdatedAt: new Date().toISOString(),
        };
        setBooks([...books, newBook]);
        setIsModalVisible(false);
        message.success("Book added successfully!");
    };

    // Handle edit book
    const handleEditBook = (values) => {
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
        setEditingBook(null);
        setIsModalVisible(false);
        message.success("Book updated successfully!");
    };

    // Handle delete book
    const handleDeleteBook = (id) => {
        confirm({
            title: "Are you sure you want to delete this book?",
            icon: <ExclamationCircleOutlined />,
            content: "This action cannot be undone.",
            okText: "Yes, Delete",
            okType: "danger",
            onOk() {
                setBooks(books.filter((book) => book.BookId !== id));
                message.success("Book deleted successfully!");
            },
        });
    };

    // Handle view book
    const handleViewBook = (id) => {
        onNavigate("book-detail", id);
    };

    // Open add modal
    const openAddModal = () => {
        setEditingBook(null);
        setIsModalVisible(true);
    };

    // Open edit modal
    const openEditModal = (book) => {
        setEditingBook(book);
        setIsModalVisible(true);
    };

    // Handle form submit
    const handleFormSubmit = (values) => {
        if (editingBook) {
            handleEditBook(values);
        } else {
            handleAddBook(values);
        }
    };

    return (
        <div>
            <PageHeader
                title="Books Management"
                description="Manage your library's book catalog"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={openAddModal}
                        size="large"
                    >
                        Add Book
                    </Button>
                }
            />

            <BookFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                languageFilter={languageFilter}
                onLanguageChange={setLanguageFilter}
            />

            <BookTable
                books={filteredBooks}
                onView={handleViewBook}
                onEdit={openEditModal}
                onDelete={handleDeleteBook}
            />

            <BookFormModal
                visible={isModalVisible}
                editingBook={editingBook}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingBook(null);
                }}
            />
        </div>
    );
}
