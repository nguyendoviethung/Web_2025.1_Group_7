import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "../style/Table.scss";
import {
  MoreOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";

export default function Table({ columns = [], rows = [], actions }) {
  const [data, setData] = useState(rows.map((r) => ({ ...r, selected: false })));
  const [selectAll, setSelectAll] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [dropdown, setDropdown] = useState({ open: false, row: null, top: 0, left: 0 });

  const dropdownRef  = useRef(null);
  // Dùng ref song song với state để đọc giá trị hiện tại bên trong event listener
  // (state trong closure của addEventListener bị stale)
  const dropdownOpenRef    = useRef(false);
  const dropdownRowIdRef   = useRef(null);

  useEffect(() => {
    setData(rows.map((r) => ({ ...r, selected: false })));
  }, [rows]);

  // Giữ ref đồng bộ với state
  useEffect(() => {
    dropdownOpenRef.current  = dropdown.open;
    dropdownRowIdRef.current = dropdown.row?.id ?? null;
  }, [dropdown]);

  // Đóng khi click ra ngoài — KHÔNG dùng btn-more vì btn-more tự xử lý toggle
  useEffect(() => {
    const handler = (e) => {
      // Nếu click vào btn-more → bỏ qua, để onClick trên button tự toggle
      if (e.target.closest && e.target.closest(".btn-more")) return;
      // Nếu click vào trong dropdown → bỏ qua
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      // Còn lại → đóng
      setDropdown((d) => ({ ...d, open: false }));
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Đóng khi scroll
  useEffect(() => {
    const handler = () => setDropdown((d) => ({ ...d, open: false }));
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, []);

  const handleSelectAll = () => {
    const next = !selectAll;
    setSelectAll(next);
    setData(data.map((r) => ({ ...r, selected: next })));
  };

  const handleSelectRow = (id) =>
    setData(data.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)));

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    const sorted = [...data].sort((a, b) => {
      if (typeof a[key] === "string")
        return direction === "asc" ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key]);
      return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
    });
    setData(sorted);
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <CaretDownOutlined style={{ opacity: 0.3 }} />;
    return sortConfig.direction === "asc"
      ? <CaretUpOutlined style={{ color: "#1677ff" }} />
      : <CaretDownOutlined style={{ color: "#1677ff" }} />;
  };

  const handleBtnMoreClick = (e, row) => {
    // Đọc từ ref — luôn là giá trị hiện tại, không bị stale closure
    const isThisRowOpen = dropdownOpenRef.current && dropdownRowIdRef.current === row.id;

    if (isThisRowOpen) {
      // Đang mở row này → đóng lại
      setDropdown((d) => ({ ...d, open: false }));
    } else {
      // Đóng row cũ (nếu có) và mở row mới
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdown({
        open: true,
        row,
        top:  rect.bottom + 6,
        left: rect.right - 170,
      });
    }
  };

  const hasActions = actions && actions.length > 0;

  return (
    <>
      <div className="table-container">
        <table className="book-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{ cursor: col.sortable !== false ? "pointer" : "default" }}
                >
                  {col.label}
                  {col.sortable !== false && renderSortIcon(col.key)}
                  {col.subtitle && <span className="location-subtitle">{col.subtitle}</span>}
                </th>
              ))}
              {hasActions && <th className="action-col">Action</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className={row.selected ? "row-selected" : ""}>
                <td>
                  <input
                    type="checkbox"
                    checked={row.selected}
                    onChange={() => handleSelectRow(row.id)}
                  />
                </td>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                  </td>
                ))}
                {hasActions && (
                  <td>
                    <div className="action-cell">
                      <button
                        className={`btn-more ${
                          dropdown.open && dropdown.row?.id === row.id ? "btn-more--active" : ""
                        }`}
                        onClick={(e) => handleBtnMoreClick(e, row)}
                      >
                        <MoreOutlined />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dropdown.open && dropdown.row &&
        createPortal(
          <div
            ref={dropdownRef}
            className="table-dropdown-portal"
            style={{ top: dropdown.top, left: dropdown.left }}
          >
            {actions.map((action, idx) => (
              <button
                key={idx}
                className={`table-dropdown-item ${action.className || ""}`}
                onClick={() => {
                  setDropdown((d) => ({ ...d, open: false }));
                  action.onClick(dropdown.row);
                }}
              >
                {action.icon && <span className="table-dropdown-icon">{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}