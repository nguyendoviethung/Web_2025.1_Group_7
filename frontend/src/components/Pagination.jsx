import { useState } from "react";
import { Button }   from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

export default function CustomPagination({
  total        = 0,
  pageSize     = 10,
  currentPage  = 1,
  onChange,          // (page) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getPageNumbers = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4)
      return [1, 2, 3, 4, 5, "...", totalPages];
    if (currentPage >= totalPages - 3)
      return [1, "...", totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages];
    return [1, "...", currentPage-1, currentPage, currentPage+1, "...", totalPages];
  };

  const go = (page) => {
    if (page === "..." || page < 1 || page > totalPages) return;
    onChange?.(page);
  };

  return (
    <div style={{
      display: "flex", gap: "8px",
      alignItems: "center", justifyContent: "center",
      marginTop: "2rem"
    }}>
      {/* Tổng số bản ghi */}
      <span style={{ fontSize: "1.4rem", color: "#8c8c8c", marginRight: "0.8rem" }}>
        Total: <strong>{total}</strong>
      </span>

      <Button shape="circle" icon={<LeftOutlined />}
              onClick={() => go(currentPage - 1)}
              disabled={currentPage === 1} />

      {getPageNumbers().map((page, index) =>
        page === "..." ? (
          <Button key={index} type="text" disabled style={{ fontSize: "1.4rem" }}>
            ...
          </Button>
        ) : (
          <Button
            key={index}
            shape="circle"
            type={page === currentPage ? "primary" : "default"}
            onClick={() => go(page)}
            style={{ fontSize: "1.3rem" }}
          >
            {page}
          </Button>
        )
      )}

      <Button shape="circle" icon={<RightOutlined />}
              onClick={() => go(currentPage + 1)}
              disabled={currentPage === totalPages} />

      {/* Hiển thị đang ở trang mấy */}
      <span style={{ fontSize: "1.3rem", color: "#8c8c8c", marginLeft: "0.8rem" }}>
        Page {currentPage} / {totalPages}
      </span>
    </div>
  );
}