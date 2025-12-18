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
import '../../style/ReaderManagement.scss';
import Table from '../../components/Table';
import CustomPagination from '../../components/Pagination'; 
import Filter from '../../components/Filter';

const ReaderManagement = () => {
 
  return (
    <div className="reader-management">
      <div className="header">  
        <h1 className = "tittle">Readers Management</h1>
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
        title_1= "Reader ID"
        title_2= "Full Name"
        title_3= "Email"
        title_4= "Phone Number"
        title_6= "Status"
      />
      <CustomPagination />
    </div>
  );
};

export default ReaderManagement;
