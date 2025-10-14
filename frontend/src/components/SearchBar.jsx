import Search from "../assets/Search.svg";
import '../style/SearchBar.scss'
export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-wrapper">
      <input
        type="text"
        placeholder="Search"
        value={value}
        onChange={onChange}
        className="search-input"
      />
      <img
        src= {Search}
        alt="search-icon"
        className="search-icon"
      />
    </div>
  );
}
