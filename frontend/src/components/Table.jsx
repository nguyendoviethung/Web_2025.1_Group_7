import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "../style/Table.scss";
import {
  MoreOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";

export default function Table({ columns = [], rows = [], actions }) {
  const [data, setData]             = useState(rows);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [dropdown, setDropdown]     = useState({ open: false, row: null, top: 0, left: 0 });

  const dropdownRef      = useRef(null);
  const dropdownOpenRef  = useRef(false);
  const dropdownRowIdRef = useRef(null);

  useEffect(() => {
    setData(rows);
  }, [rows]);

  useEffect(() => {
    dropdownOpenRef.current  = dropdown.open;
    dropdownRowIdRef.current = dropdown.row?.id ?? null;
  }, [dropdown]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.closest && e.target.closest(".btn-more")) return;
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return;
      setDropdown((d) => ({ ...d, open: false }));
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = () => setDropdown((d) => ({ ...d, open: false }));
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, []);

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    const sorted = [...data].sort((a, b) => {
      if (typeof a[key] === "string")
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
    });
    setData(sorted);
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <CaretDownOutlined style={{ opacity: 0.3 }} />;
    return sortConfig.direction === "asc"
      ? <CaretUpOutlined  style={{ color: "#1677ff" }} />
      : <CaretDownOutlined style={{ color: "#1677ff" }} />;
  };

  const handleBtnMoreClick = (e, row) => {
    const isThisRowOpen =
      dropdownOpenRef.current && dropdownRowIdRef.current === row.id;
    if (isThisRowOpen) {
      setDropdown((d) => ({ ...d, open: false }));
    } else {
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
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{ cursor: col.sortable !== false ? "pointer" : "default" }}
                >
                  {col.label}
                  {col.sortable !== false && renderSortIcon(col.key)}
                  {col.subtitle && (
                    <span className="location-subtitle">{col.subtitle}</span>
                  )}
                </th>
              ))}
              {hasActions && <th className="action-col">Action</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] ?? "—"}
                  </td>
                ))}
                {hasActions && (
                  <td>
                    <div className="action-cell">
                      <button
                        className={`btn-more ${
                          dropdown.open && dropdown.row?.id === row.id
                            ? "btn-more--active"
                            : ""
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

      {dropdown.open &&
        dropdown.row &&
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
                {action.icon && (
                  <span className="table-dropdown-icon">{action.icon}</span>
                )}
                {action.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}