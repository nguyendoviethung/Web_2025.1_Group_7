import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, message } from 'antd';
import { BookOutlined, UserOutlined, ClockCircleOutlined, ReadOutlined } from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import  axiosClient  from '../../services/axiosClient.jsx';
import '../../style/Dashboard.scss';

const PieTooltip = ({ active, payload, ageData }) => {
  if (active && payload && payload.length) {
    const { name, value, color } = payload[0].payload;
    const total = ageData.reduce((sum, item) => sum + item.value, 0);
    const percent = ((value / total) * 100).toFixed(1);

    return (
      <div className="pie-tooltip">
        <div className="tooltip-title" style={{ color }}>
          {name}
        </div>
        <div className="tooltip-value">
          {percent}%
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({ // Thẻ thống kê
    totalBooks: 0,
    totalReaders: 0,
    overdueBooks: 0,
    totalBorrowed: 0
  });
  const [monthlyData, setMonthlyData] = useState([]); // Dữ liệu mượn sách theo tháng
  const [genreData, setGenreData] = useState([]); // Dữ liệu phân bố thể loại
  const [ageData, setAgeData] = useState([]); // Dữ liệu phân bố độ tuổi
  const [topBooks, setTopBooks] = useState([]); // Sách được mượn nhiều nhất

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Gọi các API song song
      const [stats, monthly, genre, age, top] = await Promise.all([
        fetchStats(),
        fetchMonthlyLoans(),
        fetchGenreDistribution(),
        fetchAgeDistribution(),
        fetchTopBooks()
      ]);

      setStatsData(stats);
      setMonthlyData(monthly);
      setGenreData(genre);
      setAgeData(age);
      setTopBooks(top);
      
    } catch (error) {
      message.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics (Total books, readers, overdue, borrowed)
const fetchStats = async () => {
  try {
    const data = await axiosClient.get('/dashboard/stats');

    return {
      totalBooks: data.totalBooks || 0,
      totalReaders: data.totalReaders || 0,
      overdueBooks: data.overdueBooks || 0,
      totalBorrowed: data.totalBorrowed || 0
    };
  } catch (error) {
    console.error('Fetch stats error:', error);
    return { totalBooks: 0, totalReaders: 0, overdueBooks: 0, totalBorrowed: 0 };
  }
};

  // Fetch monthly loans data
const fetchMonthlyLoans = async () => {
  try {
    const data = await axiosClient.get('/dashboard/monthly-loans');
    return data.monthlyLoans || [];
  } catch (error) {
    console.error('Fetch monthly loans error:', error);
    return [];
  }
};

  // Fetch genre distribution
const fetchGenreDistribution = async () => {
  try {
    const data = await axiosClient.get('/dashboard/genre-distribution');
    return data.genres || [];
  } catch (error) {
    console.error('Fetch genre distribution error:', error);
    return [];
  }
};

  // Fetch age distribution
const fetchAgeDistribution = async () => {
  try {
    const data = await axiosClient.get('/dashboard/age-distribution');
    return data.ageGroups || [];
  } catch (error) {
    console.error('Fetch age distribution error:', error);
    return [];
  }
};

  // Fetch top borrowed books
const fetchTopBooks = async () => {
  try {
    const data = await axiosClient.get('/dashboard/top-books');
    return data.topBooks || [];
  } catch (error) {
    console.error('Fetch top books error:', error);
    return [];
  }
};

  const statCards = [
    { 
      title: 'Total books', 
      value: `${statsData.totalBooks}+`, 
      icon: <BookOutlined />, 
      color: '#E6F4FF', 
      iconColor: '#1890FF' 
    },
    { 
      title: 'Total readers', 
      value: `${statsData.totalReaders}+`, 
      icon: <UserOutlined />, 
      color: '#E6FFFB', 
      iconColor: '#52C41A' 
    },
    { 
      title: 'Overdue books', 
      value: `${statsData.overdueBooks}+`, 
      icon: <ClockCircleOutlined />, 
      color: '#FFF1F0', 
      iconColor: '#FF4D4F' 
    },
    { 
      title: 'Total books borrowed', 
      value: `${statsData.totalBorrowed}+`, 
      icon: <ReadOutlined />, 
      color: '#F0E6FF', 
      iconColor: '#722ED1' 
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
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

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
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
                    <Line type="monotone" dataKey="loans" stroke="#5399f3ff" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  No data available
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Readership chart by age" className="chart-card">
              {ageData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {ageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip ageData={ageData} />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="legend">
                    {ageData.map((item, index) => (
                      <div key={index} className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: item.color }}></span>
                        <span className="legend-text">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  No data available
                </div>
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="Number of books by genre" className="chart-card">
              <div className="year-badge">2025</div>
              {genreData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={genreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="genre" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" radius={[8, 8, 0, 0]}>
                      {genreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 30}, 70%, 60%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  No data available
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Top most borrowed books" className="chart-card">
              {topBooks.length > 0 ? (
                <div className="books-list">
                  {topBooks.map((book) => (
                    <div key={book.id} className="book-item">
                      <img src={book.cover} alt={book.title} className="book-cover" />
                      <div className="book-info">
                        <div className="book-title">{book.title}</div>
                        <div className="book-loans">Number of loans: {book.loans}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  No data available
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
