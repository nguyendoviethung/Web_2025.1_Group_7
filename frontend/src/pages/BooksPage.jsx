import React from "react";
import BooksManagement from "../components/books/BooksManagement";

export default function BooksPage({ onNavigate }) {
    return <BooksManagement onNavigate={onNavigate} />;
}
