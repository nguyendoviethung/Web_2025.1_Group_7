import React, { useState, useRef } from 'react';
import { Card, Button, Table, Tag, Input, Select, DatePicker, Modal, Space, Avatar, Statistic, Row, Col, Tabs, Badge, Dropdown, message } from 'antd';
import { ScanOutlined, BookOutlined, UserOutlined, SearchOutlined, FilterOutlined, DownloadOutlined, ReloadOutlined, ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, MoreOutlined, EyeOutlined, PrinterOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function BorrowBooks() {
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [scanType, setScanType] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const videoRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  const borrowedBooks = [
    {
      key: 1,
      transactionId: 'TXN001',
      bookTitle: 'The Great Gatsby',
      bookCover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100&h=140&fit=crop',
      isbn: '978-0-7432-7356-5',
      reader: {
        name: 'John Doe',
        id: 'RD001',
        avatar: 'https://i.pravatar.cc/150?img=1',
        email: 'john@example.com',
        phone: '+84 123 456 789'
      },
      borrowDate: '2025-12-10',
      dueDate: '2025-12-24',
      returnDate: null,
      status: 'borrowed'
    },
    {
      key: 2,
      transactionId: 'TXN002',
      bookTitle: 'To Kill a Mockingbird',
      bookCover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100&h=140&fit=crop',
      isbn: '978-0-06-112008-4',
      reader: {
        name: 'Jane Smith',
        id: 'RD002',
        avatar: 'https://i.pravatar.cc/150?img=2',
        email: 'jane@example.com',
        phone: '+84 987 654 321'
      },
      borrowDate: '2025-12-05',
      dueDate: '2025-12-19',
      returnDate: null,
      status: 'overdue'
    },
    {
      key: 3,
      transactionId: 'TXN003',
      bookTitle: '1984',
      bookCover: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=100&h=140&fit=crop',
      isbn: '978-0-452-28423-4',
      reader: {
        name: 'Bob Johnson',
        id: 'RD003',
        avatar: 'https://i.pravatar.cc/150?img=3',
        email: 'bob@example.com',
        phone: '+84 555 123 456'
      },
      borrowDate: '2025-12-01',
      dueDate: '2025-12-15',
      returnDate: '2025-12-14',
      status: 'returned'
    },
    {
      key: 4,
      transactionId: 'TXN004',
      bookTitle: 'Pride and Prejudice',
      bookCover: 'https://images.unsplash.com/photo-1512820790803-83ca734da792?w=100&h=140&fit=crop',
      isbn: '978-0-14-143951-8',
      reader: {
        name: 'Alice Brown',
        id: 'RD004',
        avatar: 'https://i.pravatar.cc/150?img=4',
        email: 'alice@example.com',
        phone: '+84 222 333 444'
      },
      borrowDate: '2025-12-12',
      dueDate: '2025-12-26',
      returnDate: null,
      status: 'borrowed'
    },
  ];

  const stats = {
    total: borrowedBooks.length,
    borrowed: borrowedBooks.filter(b => b.status === 'borrowed').length,
    overdue: borrowedBooks.filter(b => b.status === 'overdue').length,
    returned: borrowedBooks.filter(b => b.status === 'returned').length
  };

  const handleOpenScan = (type) => {
    setScanType(type);
    setScanModalVisible(true);
  };

  const handleCloseScan = () => {
    setScanModalVisible(false);
  };

  const handleScanSuccess = () => {
    message.success(`${scanType === 'borrow' ? 'Book borrowed' : 'Book returned'} successfully!`);
    setScanModalVisible(false);
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      borrowed: { color: 'blue', icon: <BookOutlined />, text: 'Borrowed' },
      overdue: { color: 'red', icon: <ExclamationCircleOutlined />, text: 'Overdue' },
      returned: { color: 'green', icon: <CheckCircleOutlined />, text: 'Returned' }
    };
    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const actionMenu = (record) => ({
    items: [
      {
        key: 'view',
        label: 'View Details',
        icon: <EyeOutlined />,
        onClick: () => handleViewDetails(record)
      },
      {
        key: 'print',
        label: 'Print Receipt',
        icon: <PrinterOutlined />
      },
      {
        type: 'divider'
      },
      {
        key: 'return',
        label: 'Return Book',
        icon: <CheckCircleOutlined />,
        disabled: record.status === 'returned'
      }
    ]
  });

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 120,
      render: (text) => <span style={{ fontFamily: 'monospace', fontWeight: 500, color: '#6366f1' }}>{text}</span>
    },
    {
      title: 'Book',
      key: 'book',
      width: 280,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <img 
            src={record.bookCover} 
            alt={record.bookTitle} 
            style={{ width: 50, height: 70, objectFit: 'cover', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#262626', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {record.bookTitle}
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>ISBN: {record.isbn}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Reader',
      key: 'reader',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Avatar src={record.reader.avatar} size={32} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#262626' }}>{record.reader.name}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.reader.id}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Borrow Date',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      width: 120,
      sorter: (a, b) => new Date(a.borrowDate) - new Date(b.borrowDate)
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date, record) => (
        <span style={{ color: record.status === 'overdue' ? '#ff4d4f' : 'inherit', fontWeight: record.status === 'overdue' ? 500 : 'normal' }}>
          {date}
        </span>
      )
    },
    {
      title: 'Return Date',
      dataIndex: 'returnDate',
      key: 'returnDate',
      width: 120,
      render: (date) => date || <span style={{ color: '#bfbfbf' }}>-</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Borrowed', value: 'borrowed' },
        { text: 'Overdue', value: 'overdue' },
        { text: 'Returned', value: 'returned' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown menu={actionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  const filteredData = activeTab === 'all' 
    ? borrowedBooks 
    : borrowedBooks.filter(b => b.status === activeTab);

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#262626', margin: '0 0 8px 0' }}>
            Borrow & Return Management
          </h1>
          <p style={{ fontSize: 14, color: '#8c8c8c', margin: 0 }}>
            Manage book borrowing and returning transactions
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button 
            type="primary" 
            icon={<ScanOutlined />} 
            size="large"
            onClick={() => handleOpenScan('borrow')}
            style={{ background: '#6366f1', borderColor: '#6366f1' }}
          >
            Borrow Book
          </Button>
          <Button 
            icon={<ScanOutlined />} 
            size="large"
            onClick={() => handleOpenScan('return')}
            style={{ borderColor: '#52c41a', color: '#52c41a' }}
          >
            Return Book
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Total Transactions" 
              value={stats.total}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#6366f1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Currently Borrowed" 
              value={stats.borrowed}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Overdue Books" 
              value={stats.overdue}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Returned Today" 
              value={stats.returned}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'all', label: <span><Badge count={stats.total} style={{ marginLeft: 8 }} />All Transactions</span> },
            { key: 'borrowed', label: <span><Badge count={stats.borrowed} color="blue" style={{ marginLeft: 8 }} />Borrowed</span> },
            { key: 'overdue', label: <span><Badge count={stats.overdue} color="red" style={{ marginLeft: 8 }} />Overdue</span> },
            { key: 'returned', label: <span><Badge count={stats.returned} color="green" style={{ marginLeft: 8 }} />Returned</span> }
          ]}
        />
        
        <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
          <Input 
            placeholder="Search by book, reader..." 
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
          />
          <Select placeholder="Filter by status" style={{ width: 150 }}>
            <Option value="all">All Status</Option>
            <Option value="borrowed">Borrowed</Option>
            <Option value="overdue">Overdue</Option>
            <Option value="returned">Returned</Option>
          </Select>
          <RangePicker />
          <Button icon={<FilterOutlined />}>More Filters</Button>
          <Button icon={<DownloadOutlined />}>Export</Button>
          <Button icon={<ReloadOutlined />}>Refresh</Button>
        </Space>

        <Table 
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} transactions`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ScanOutlined style={{ fontSize: 24, color: '#6366f1' }} />
            <span>{scanType === 'borrow' ? 'Scan to Borrow Book' : 'Scan to Return Book'}</span>
          </div>
        }
        open={scanModalVisible}
        onCancel={handleCloseScan}
        footer={null}
        width={600}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '100%', 
            maxWidth: 400, 
            aspectRatio: '1', 
            background: '#000', 
            borderRadius: 16, 
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{ color: '#fff', fontSize: 18 }}>📷 Camera View</div>
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '20%',
              right: '20%',
              bottom: '20%',
              border: '3px solid #6366f1',
              borderRadius: 8
            }} />
          </div>
          
          <p style={{ fontSize: 15, color: '#262626', margin: '0 0 8px 0' }}>
            Position the QR code within the frame
          </p>
          <p style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 24 }}>
            {scanType === 'borrow' 
              ? 'Scan book QR code to process borrowing'
              : 'Scan book QR code to process return'}
          </p>
          
          <Space>
            <Button size="large" onClick={handleCloseScan}>Cancel</Button>
            <Button type="primary" size="large" onClick={handleScanSuccess}>
              Simulate Scan Success
            </Button>
          </Space>
        </div>
      </Modal>

      <Modal
        title="Transaction Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />}>Print Receipt</Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>Close</Button>,
          selectedRecord?.status !== 'returned' && (
            <Button key="return" type="primary">Process Return</Button>
          )
        ]}
        width={700}
      >
        {selectedRecord && (
          <div>
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <h4 style={{ fontSize: 16, fontWeight: 600, borderBottom: '2px solid #f0f0f0', paddingBottom: 8, marginBottom: 16 }}>
                  Book Information
                </h4>
                <div style={{ display: 'flex', gap: 16 }}>
                  <img 
                    src={selectedRecord.bookCover} 
                    alt={selectedRecord.bookTitle}
                    style={{ width: 80, height: 110, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  />
                  <div>
                    <p style={{ margin: '8px 0', fontSize: 14 }}>
                      <strong>Title:</strong> {selectedRecord.bookTitle}
                    </p>
                    <p style={{ margin: '8px 0', fontSize: 14 }}>
                      <strong>ISBN:</strong> {selectedRecord.isbn}
                    </p>
                  </div>
                </div>
              </Col>
              <Col span={24}>
                <h4 style={{ fontSize: 16, fontWeight: 600, borderBottom: '2px solid #f0f0f0', paddingBottom: 8, marginBottom: 16 }}>
                  Transaction Details
                </h4>
                <p style={{ margin: '8px 0', fontSize: 14 }}>
                  <strong>Transaction ID:</strong> {selectedRecord.transactionId}
                </p>
                <p style={{ margin: '8px 0', fontSize: 14 }}>
                  <strong>Borrow Date:</strong> {selectedRecord.borrowDate}
                </p>
                <p style={{ margin: '8px 0', fontSize: 14 }}>
                  <strong>Due Date:</strong> {selectedRecord.dueDate}
                </p>
                <p style={{ margin: '8px 0', fontSize: 14 }}>
                  <strong>Return Date:</strong> {selectedRecord.returnDate || 'Not returned'}
                </p>
              </Col>
              <Col span={24}>
                <h4 style={{ fontSize: 16, fontWeight: 600, borderBottom: '2px solid #f0f0f0', paddingBottom: 8, marginBottom: 16 }}>
                  Reader Information
                </h4>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <Avatar src={selectedRecord.reader.avatar} size={64} />
                  <div>
                    <p style={{ margin: '8px 0', fontSize: 14 }}>
                      <strong>Name:</strong> {selectedRecord.reader.name}
                    </p>
                    <p style={{ margin: '8px 0', fontSize: 14 }}>
                      <strong>ID:</strong> {selectedRecord.reader.id}
                    </p>
                    <p style={{ margin: '8px 0', fontSize: 14 }}>
                      <strong>Email:</strong> {selectedRecord.reader.email}
                    </p>
                    <p style={{ margin: '8px 0', fontSize: 14 }}>
                      <strong>Phone:</strong> {selectedRecord.reader.phone}
                    </p>
                  </div>
                </div>
              </Col>
              <Col span={24}>
                <h4 style={{ fontSize: 16, fontWeight: 600, borderBottom: '2px solid #f0f0f0', paddingBottom: 8, marginBottom: 16 }}>
                  Status Information
                </h4>
                <p style={{ margin: '8px 0', fontSize: 14 }}>
                  <strong>Status:</strong> {getStatusTag(selectedRecord.status)}
                </p>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}