import React from "react";
import { Card, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;

export function SearchCard({ placeholder = "Search...", value, onChange }) {
    return (
        <Card style={{ marginBottom: 24 }}>
            <Search
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
                size="large"
                style={{ width: "100%" }}
            />
        </Card>
    );
}
