import React from "react";
import { Select } from "antd";
import { FilterOutlined } from "@ant-design/icons";

export default function FilterComponent({ filterName, options }) {
  return (
    <Select
      placeholder={filterName}
      style={{ width: 200 }}
      allowClear
      suffixIcon={<FilterOutlined style={{ color: "#088ef5ff" , fontSize : "1.5rem"}} />} // 💡 Icon nằm trong Select
      options={options}
    />
  );
}
