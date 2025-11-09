import { useState } from "react";
import { Pagination, Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

export default function CustomPagination() {
  const totalPages = 25; // arr.length
  const [currentPage, setCurrentPage] = useState(1);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const handlePageClick = (page) => {
    if (page === "...") return;
    setCurrentPage(page);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  const pages = getPageNumbers();

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" , justifyContent: "center", marginTop: "2rem"}}>
      <Button
        shape="circle"
        icon={<LeftOutlined />}
        onClick={handlePrev}
        disabled={currentPage === 1}
      />

      {pages.map((page, index) =>
        page === "..." ? (
          <Button key={index} type="text" disabled>
            ...
          </Button>
        ) : (
          <Button
            key={index}
            shape="circle"
            type={page === currentPage ? "primary" : "default"}
            onClick={() => handlePageClick(page)}
          >
            {page}
          </Button>
        )
      )}

      <Button
        shape="circle"
        icon={<RightOutlined />}
        onClick={handleNext}
        disabled={currentPage === totalPages}
      />
    </div>
  );
}
