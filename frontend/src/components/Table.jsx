import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import "../style/Table.scss";
import {
  MoreOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";

// ── Tính toán vị trí dropdown, tự flip lên trên nếu không đủ chỗ ──────────
function calcDropdownPos(triggerRect, itemCount = 4) {
  const ITEM_H  = 42;
  const PADDING = 16;
  const WIDTH   = 190;
  const MARGIN  = 8;
  const estH    = itemCount * ITEM_H + PADDING;
  const vpH     = window.innerHeight;
  const vpW     = window.innerWidth;

  let top  = triggerRect.bottom + MARGIN;
  let left = triggerRect.right  - WIDTH;

  // Không đủ chỗ bên dưới → flip lên trên
  if (top + estH > vpH - MARGIN) {
    top = triggerRect.top - estH - MARGIN;
  }

  if (top  < MARGIN) top  = MARGIN;
  if (left < MARGIN) left = MARGIN;
  if (left + WIDTH > vpW - MARGIN) left = vpW - WIDTH - MARGIN;

  return { top, left };
}

/**
 * Table component dùng chung cho BookManagement và ReaderManagement.
 *
 * Props:
 *   columns      — array of column definitions
 *                  { key, label, sortable?, subtitle?, render?(value, row, idx) }
 *   rows         — array of data rows (mỗi row phải có field `id`)
 *
 *   actions      — (Option A) mảng action TĨNH, giống nhau cho mọi row
 *                  [{ label, icon, className, onClick(row) }]
 *
 *   getActions   — (Option B) hàm trả về mảng action ĐỘNG theo từng row
 *                  (row) => [{ label, icon, className, onClick() }]
 *                  Note: onClick ở đây KHÔNG nhận row vì đã capture trong closure
 *
 *   rowClassName — (optional) (row) => string  — thêm class cho <tr>
 *
 * Nếu truyền cả hai thì getActions được ưu tiên.
 */
export default function Table({
  columns      = [],
  rows         = [],
  actions,
  getActions,
  rowClassName,
}) {
  const [data,       setData]       = useState(rows);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [dropdown,   setDropdown]   = useState({
    open:            false,
    row:             null,
    top:             0,
    left:            0,
    resolvedActions: [],  
  });

  const dropdownRef     = useRef(null);
  const triggerRowIdRef = useRef(null);
  const isOpenRef       = useRef(false);

  useEffect(() => { setData(rows); }, [rows]);

  // Sync refs để tránh stale closure trong event handler
  useEffect(() => {
    isOpenRef.current       = dropdown.open;
    triggerRowIdRef.current = dropdown.row?.id ?? null;
  }, [dropdown]);

  //  Đóng khi click ngoài 
  useEffect(() => {
    const handler = (e) => {
      if (e.target.closest?.(".btn-more"))         return;
      if (dropdownRef.current?.contains(e.target)) return;
      setDropdown(d => ({ ...d, open: false }));
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  //  Đóng khi scroll NGOÀI dropdown 
  useEffect(() => {
    const handler = (e) => {
      if (!isOpenRef.current)                      return;
      if (dropdownRef.current?.contains(e.target)) return;
      setDropdown(d => ({ ...d, open: false }));
    };
    window.addEventListener("scroll", handler, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", handler, { capture: true, passive: true });
  }, []);

  // Đóng khi resize 
  useEffect(() => {
    const handler = () => setDropdown(d => ({ ...d, open: false }));
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
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

  const handleBtnMoreClick = useCallback((e, row) => {
    e.stopPropagation();

    // Toggle nếu click lại cùng row
    if (isOpenRef.current && triggerRowIdRef.current === row.id) {
      setDropdown(d => ({ ...d, open: false }));
      return;
    }

    // Resolve actions:
    //   getActions(row) động  (ReaderManagement — label/icon thay đổi theo status)
    //   actions         tĩnh  (BookManagement   — luôn cùng 4 actions)
    const resolvedActions = getActions
      ? getActions(row)
      : (actions ?? []);

    const rect = e.currentTarget.getBoundingClientRect();
    const { top, left } = calcDropdownPos(rect, resolvedActions.length);

    setDropdown({ open: true, row, top, left, resolvedActions });
  }, [actions, getActions]);

  const hasActions = !!(actions?.length || getActions);

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
            {data.map((row, idx) => (
              <tr
                key={row.id}
                className={rowClassName ? rowClassName(row) : ""}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? col.render(row[col.key], row, idx)
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

      {dropdown.open && dropdown.row &&
        createPortal(
          <div
            ref={dropdownRef}
            className="table-dropdown-portal"
            style={{ top: dropdown.top, left: dropdown.left }}
          >
            {dropdown.resolvedActions.map((action, idx) => (
              <button
                key={idx}
                className={`table-dropdown-item ${action.className || ""}`}
                onClick={() => {
                  setDropdown(d => ({ ...d, open: false }));
                  // Option A: onClick(row) — BookManagement
                  // Option B: onClick()   — ReaderManagement (row captured in closure)
                  if (getActions) {
                    action.onClick();
                  } else {
                    action.onClick(dropdown.row);
                  }
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