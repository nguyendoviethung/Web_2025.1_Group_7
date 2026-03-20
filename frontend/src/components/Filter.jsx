import { Select } from "antd";
import { FilterOutlined } from "@ant-design/icons";

export default function Filter({ filterName, options = [], value, onChange }) {
  return (
    <Select
      placeholder={filterName}
      style={{ width: 180 }}
      allowClear
      value={value || undefined}
      onChange={(val) => onChange?.(val ?? "")}
      suffixIcon={
        <FilterOutlined style={{ color: "#088ef5ff", fontSize: "1.5rem" }} />
      }
      options={options}
    />
  );
}