import React, { useState } from "react";
import "../style/Table.scss";
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";

export default function Table({title_1, title_2 , title_3, title_4, title_5, title_6}) {
  const [books, setBooks] = useState([
    {
      id: "BK001",
      name: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JK",
      location: "8 - 2 - 2",
      quantity: 40,
      selected: false,
    },
    {
      id: "BK002",
      name: "The Lord of the Rings",
      author: "J.R.R. Tolkien",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tolkien",
      location: "5 - 1 - 3",
      quantity: 25,
      selected: false,
    },
    {
      id: "BK003",
      name: "1984",
      author: "George Orwell",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Orwell",
      location: "3 - 4 - 1",
      quantity: 30,
      selected: false,
    },
    {
      id: "BK004",
      name: "To Kill a Mockingbird",
      author: "Harper Lee",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Harper",
      location: "2 - 3 - 5",
      quantity: 18,
      selected: false,
    },
    {
      id: "BK005",
      name: "Pride and Prejudice",
      author: "Jane Austen",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      location: "7 - 2 - 1",
      quantity: 22,
      selected: false,
    },
  ]);

  const [selectAll, setSelectAll] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // trạng thái sắp xếp
  const [sortConfig, setSortConfig] = useState({
    key: null, // tên cột đang sắp xếp
    direction: "asc", // asc | desc
  });

  // --- Chức năng chọn checkbox ---
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setBooks(books.map((book) => ({ ...book, selected: newSelectAll })));
  };

  const handleSelectBook = (id) => {
    setBooks(
      books.map((book) =>
        book.id === id ? { ...book, selected: !book.selected } : book
      )
    );
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // --- Chức năng sắp xếp ---
  const handleSort = (key) => {
    let direction = "asc";

    // nếu đang sort cùng 1 cột → đảo chiều
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...books].sort((a, b) => {
      if (typeof a[key] === "string") {
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      } else {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      }
    });

    setBooks(sorted);
    setSortConfig({ key, direction });
  };

  // --- Render biểu tượng sắp xếp ---
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <CaretDownOutlined style={{ opacity: 0.3 }} />;
    return sortConfig.direction === "asc" ? (
      <CaretUpOutlined style={{ color: "#1677ff" }} />
    ) : (
      <CaretDownOutlined style={{ color: "#1677ff" }} />
    );
  };

  return (
    <div className="table-container">
      <table className="book-table">
        <thead>
          <tr>
            <th className="checkbox-col">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
            </th>
            <th onClick={() => handleSort("id")} style = {{ cursor: "pointer"}}>
             {title_1} {renderSortIcon("id")}
            </th>
            <th onClick={() => handleSort("name")} style = {{ cursor: "pointer"}}>
              {title_2} {renderSortIcon("name")}
            </th>
            <th onClick={() => handleSort("author")} style = {{ cursor: "pointer"}}>
              {title_3} {renderSortIcon("author")}
            </th>
            <th onClick={() => handleSort("location")} style = {{ cursor: "pointer"}}>
              {title_4} {renderSortIcon("location")}
              <span className="location-subtitle">
                {title_5}
              </span>
            </th>
            <th onClick={() => handleSort("quantity")} style = {{ cursor: "pointer"}}>
              {title_6} {renderSortIcon("quantity")}
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>
                <input
                  type="checkbox"
                  checked={book.selected}
                  onChange={() => handleSelectBook(book.id)}
                />
              </td>
              <td>
                <div className="book-id">
                  <span>{book.id}</span>
                </div>
              </td>
              <td className="book-name">{book.name}</td>
              <td>
                <div className="author-info">
                  <img
                    src={book.authorAvatar}
                    alt={book.author}
                    className="author-avatar"
                  />
                  <span>{book.author}</span>
                </div>
              </td>
              <td>{book.location}</td>
              <td>
                <strong>{book.quantity}</strong>
              </td>
              <td>
                <div className="action-cell">
                  <button
                    className="btn-more"
                    onClick={() => toggleDropdown(book.id)}
                  >
                    <MoreOutlined />
                  </button>
                  {activeDropdown === book.id && (
                    <div className="dropdown-menu">
                      <button className="dropdown-item edit">
                        <EditOutlined />
                        Edit
                      </button>
                      <button className="dropdown-item delete">
                        <DeleteOutlined />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
