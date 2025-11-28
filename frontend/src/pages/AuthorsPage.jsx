import React from "react";
import AuthorsManagement from "../components/AuthorsManagement";

export default function AuthorsPage({ onNavigate }) {
    return <AuthorsManagement onNavigate={onNavigate} />;
}
