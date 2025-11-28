import React from "react";
import { Card, Space, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;

export function FilterBar({ searchConfig, selectFilters = [] }) {
    return (
        <Card style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {searchConfig && (
                    <Search
                        placeholder={searchConfig.placeholder}
                        value={searchConfig.value}
                        onChange={(e) => searchConfig.onChange(e.target.value)}
                        prefix={<SearchOutlined />}
                        allowClear
                        size="large"
                        style={{ flex: 1, minWidth: 200 }} // chiếm toàn bộ còn lại
                    />
                )}

                {selectFilters.map((filter, index) => (
                    <Select
                        key={index}
                        value={filter.value}
                        onChange={filter.onChange}
                        placeholder={filter.placeholder}
                        size="large"
                        style={{ minWidth: 180 }}
                    >
                        {filter.options.map((option) => (
                            <Select.Option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </Select.Option>
                        ))}
                    </Select>
                ))}
            </div>
        </Card>
    );
}
