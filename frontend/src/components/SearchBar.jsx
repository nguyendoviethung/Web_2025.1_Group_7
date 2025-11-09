import Search from "../assets/Search.svg";
import '../style/SearchBar.scss'
import { SearchOutlined } from "@ant-design/icons";
export default function SearchBar() {
  return (
  <div className="search-box">
    <SearchOutlined className="search-icon"/>
      <input
        type="text"
        placeholder="Search"
        value= ""
     />
  </div>
  );
}
