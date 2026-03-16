import React from 'react';
import { PlusOutlined } from "@ant-design/icons";
import SearchBar from '../../components/SearchBar';
import '../../style/ReaderManagement.scss';
import Table from '../../components/Table';
import CustomPagination from '../../components/Pagination';
import Filter from '../../components/Filter';

// --- Định nghĩa cột cho bảng độc giả ---
const READER_COLUMNS = [
  { key: "id", label: "Reader ID" },

  {
    key: "fullName",
    label: "Full Name",
    render: (value, row) => (
      <div className="reader-info">
        <img
          src={row.avatar}
          alt={value}
          className="reader-avatar"
        />
        <span>{value}</span>
      </div>
    ),
  },

  { key: "email", label: "Email" },

  {
    key: "status",
    label: "Status",
    sortable: false,
    render: (value) => (
      <span className={`status-badge status-${value?.toLowerCase()}`}>
        {value}
      </span>
    ),
  },
];

// --- Dữ liệu mẫu ---
const READER_DATA = [
  {
    id: "RD001",
    fullName: "Nguyen Van An",
    email: "an.nguyen@email.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=an",
    status: "Active",
  },
  {
    id: "RD002",
    fullName: "Tran Thi Bich",
    email: "bich.tran@email.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bich",
    status: "Active",
  },
  {
    id: "RD003",
    fullName: "Le Minh Duc",
    email: "duc.le@email.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=duc",
    status: "Inactive",
  },
  {
    id: "RD004",
    fullName: "Pham Thu Ha",
    email: "ha.pham@email.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ha",
    status: "Active",
  },
  {
    id: "RD005",
    fullName: "Hoang Quoc Khanh",
    email: "khanh.hoang@email.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=khanh",
    status: "Suspended",
  },
];
const ReaderManagement = () => {
  return (
    <div className="reader-management">
      <div className="header">
        <h1 className="tittle">Readers Management</h1>
        <div className="header-actions">
          <Filter filterName="Status" />
          <SearchBar />
          <button className="btn-add">
            <PlusOutlined />
            Add New
          </button>
        </div>
      </div>

      <Table columns={READER_COLUMNS} rows={READER_DATA} />

      <CustomPagination />
    </div>
  );
};

export default ReaderManagement;