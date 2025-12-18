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
          <Filter filterName="Author"/>  
          <SearchBar />
          <button className="btn-add">
            <PlusOutlined />
            Add New
          </button>
        </div>
      </div>   
      <Table 
        title_1= "Book ID"
        title_2= "Book Name"
        title_3= "Author"
        title_4= "Location"
        title_5= "Floor - Room - Bookshelf" 
        title_6= "Quantity"
      />
      <CustomPagination />
    </div>
  );
};

export default BookManagement;
