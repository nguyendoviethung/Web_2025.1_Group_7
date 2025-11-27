import React from "react";
import { Card, Input, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;

export default function BookFilters({
    searchQuery,
    onSearchChange,
    languageFilter,
    onLanguageChange,
}) {
    const languages = [
        "All",
        "English",
        "Spanish",
        "French",
        "German",
        "Chinese",
    ];

    return (
        <Card style={{ marginBottom: 24 }}>
            <Space size="middle" style={{ width: "100%", flexWrap: "wrap" }}>
                <Search
                    placeholder="Search by title, ISBN, or publisher..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{ width: 400 }}
                    prefix={<SearchOutlined />}
                    allowClear
                />

                <Select
                    value={languageFilter}
                    onChange={onLanguageChange}
                    style={{ width: 180 }}
                    placeholder="Select Language"
                >
                    {languages.map((lang) => (
                        <Select.Option key={lang} value={lang}>
                            {lang}
                        </Select.Option>
                    ))}
                </Select>
            </Space>
        </Card>
    );
}
