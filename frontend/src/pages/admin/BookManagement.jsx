import React, { useState } from 'react';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import SearchBar from '../../components/SearchBar';
import '../../style/BookManagement.scss';
import Table from '../../components/Table';
import CustomPagination from '../../components/Pagination'; 
import Filter from '../../components/Filter';

const BookManagement = () => {
 
  return (
    <div className="book-management">
      <div className="header">  
        <h1 className = "tittle">Books Management</h1>
        <div className="header-actions">
          <Filter filterName="Book Id"/>  
          <SearchBar />
          <button className="btn-add">
            <PlusOutlined />
            Add New
          </button>
        </div>
      </div>   
      <Table />
      <CustomPagination />
    </div>
  );
};

export default BookManagement;
