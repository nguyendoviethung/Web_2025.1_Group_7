import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, message } from 'antd';
import { BookOutlined, UserOutlined, ClockCircleOutlined, ReadOutlined } from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import axiosClient from '../../services/axiosClient.jsx';
import '../../style/Dashboard.scss';

// Màu sắc cho từng cột category
const CATEGORY_COLORS = [
  '#5399f3', '#52c41a', '#ff4d4f', '#faad14',
  '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16',
];

// Custom tooltip cho chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">{payload[0].value} lượt mượn</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [loading, setLoading]           = useState(true);
  const [statsData, setStatsData]       = useState({
    totalBooks: 0, totalReaders: 0, overdueBooks: 0, totalBorrowed: 0
  });
  const [monthlyData,   setMonthlyData]   = useState([]);
  const [categoryData,  setCategoryData]  = useState([]); // ← đổi tên
  const [activeReaders, setActiveReaders] = useState([]);
  const [topBooks,      setTopBooks]      = useState([]);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, monthly, category, age, top] = await Promise.all([
        fetchStats(),
        fetchMonthlyLoans(),
        fetchCategoryDistribution(), // ← đổi tên
        fetchAgeDistribution(),
        fetchTopBooks(),
      ]);
      setStatsData(stats);
      setMonthlyData(monthly);
      setCategoryData(category); // ← đổi tên
      setActiveReaders(age);
      setTopBooks(top);
    } catch (error) {
      message.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await axiosClient.get('/dashboard/stats');
      return {
        totalBooks:    data.totalBooks    || 0,
        totalReaders:  data.totalReaders  || 0,
        overdueBooks:  data.overdueBooks  || 0,
        totalBorrowed: data.totalBorrowed || 0,
      };
    } catch { return { totalBooks: 0, totalReaders: 0, overdueBooks: 0, totalBorrowed: 0 }; }
  };

  const fetchMonthlyLoans = async () => {
    try {
      const data = await axiosClient.get('/dashboard/monthly-loans');
      return data.monthlyLoans || [];
    } catch { return []; }
  };

  // ← đổi endpoint
  const fetchCategoryDistribution = async () => {
    try {
      const data = await axiosClient.get('/dashboard/category-distribution');
      return data.categories || [];
    } catch { return []; }
  };

  const fetchAgeDistribution = async () => {
    try {
      const data = await axiosClient.get('/dashboard/age-distribution');
      return data.ageGroups || [];
    } catch { return []; }
  };

  const fetchTopBooks = async () => {
    try {
      const data = await axiosClient.get('/dashboard/top-books');
      return data.topBooks || [];
    } catch { return []; }
  };

  const statCards = [
    { title: 'Total Books',        value: `${statsData.totalBooks}+`,    icon: <BookOutlined />,        color: '#E6F4FF', iconColor: '#1890FF' },
    { title: 'Total Readers',      value: `${statsData.totalReaders}+`,  icon: <UserOutlined />,        color: '#E6FFFB', iconColor: '#52C41A' },
    { title: 'Overdue Books',      value: `${statsData.overdueBooks}+`,  icon: <ClockCircleOutlined />, color: '#FFF1F0', iconColor: '#FF4D4F' },
    { title: 'Currently Borrowed', value: `${statsData.totalBorrowed}+`, icon: <ReadOutlined />,        color: '#F0E6FF', iconColor: '#722ED1' },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="header">
          <h1>Dashboard</h1>
        </div>

        {/* ── Stat Cards ── */}
        <Row gutter={[16, 16]}>
          {statCards.map((card, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: card.color, color: card.iconColor }}>
                  {card.icon}
                </div>
                <div className="stat-content">
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-title">{card.title}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ── Row 2: Loans per Month + Top Borrowed Categories ── */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>

          {/* Loans per Month */}
          <Col xs={24} lg={12}>
            <Card title="Loans per Month" className="chart-card">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#2c3e50', border: 'none', borderRadius: 8, color: '#fff' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="loans" stroke="#5399f3" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No data available</div>
              )}
            </Card>
          </Col>

          {/* ← Top Borrowed Categories (thay Overdue Trend) */}
          <Col xs={24} lg={12}>
            <Card title="Top Borrowed Categories" className="chart-card">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={categoryData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 11 }}
                      angle={-30}
                      textAnchor="end"
                      height={70}
                      interval={0}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total_borrows" radius={[6, 6, 0, 0]} maxBarSize={48}>
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No data available</div>
              )}
            </Card>
          </Col>

        </Row>

        {/* ── Row 3: Top Active Readers + Top Books ── */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>

          <Col xs={24} lg={12}>
            <Card title="Top Active Readers" className="chart-card">
              {activeReaders.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activeReaders} margin={{ bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      angle={-20}
                      textAnchor="end"
                      height={70}
                      interval={0}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {activeReaders.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 40}, 70%, 60%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">No data available</div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Top Most Borrowed Books" className="chart-card">
              {topBooks.length > 0 ? (
                <div className="books-list">
                  {topBooks.map((book, index) => (
                    <div key={book.id} className="book-item">
                      <span className={`book-rank rank-${index + 1}`}>
                        #{index + 1}
                      </span>
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="book-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/50x70?text=No+Cover';
                        }}
                      />
                      <div className="book-info">
                        <div className="book-title">{book.title}</div>
                        <div className="book-loans">{book.loans} loans</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No data available</div>
              )}
            </Card>
          </Col>

        </Row>
      </div>
    </div>
  );
}