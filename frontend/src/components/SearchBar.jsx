import '../style/SearchBar.scss';
import { SearchOutlined } from "@ant-design/icons";

export default function SearchBar({ value = "", onChange, placeholder = "Search..." }) {
  return (
    <div className="search-box">
      <SearchOutlined className="search-icon" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}