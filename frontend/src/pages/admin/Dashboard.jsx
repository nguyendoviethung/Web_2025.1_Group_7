import React from 'react';
import { Card, Row, Col, Avatar } from 'antd';
import { BookOutlined, UserOutlined, ClockCircleOutlined, ReadOutlined } from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../../style/Dashboard.scss';

const monthlyData = [
  { month: '01/2025', loans: 55 },
  { month: '02/2025', loans: 38},
  { month: '03/2025', loans: 60 },
  { month: '04/2025', loans: 35 },
  { month: '05/2025', loans: 48 },
  { month: '06/2025', loans: 75 },
  { month: '07/2025', loans: 45 },
  { month: '08/2025', loans: 52 },
  { month: '09/2025', loans: 70 },
  { month: '10/2025', loans: 68 },
];

const genreData = [
  { genre: 'Figma', value: 80 },
  { genre: 'Sketch', value: 20 },
  { genre: 'XD', value: 35 },
  { genre: 'Photos hop', value: 45 },
  { genre: 'Illustrator', value: 55 },
  { genre: 'AfterEff ect', value: 25 },
  { genre: 'InDesign', value: 85 },
  { genre: 'Maye', value: 18 },
  { genre: 'Primiere', value: 65 },
  { genre: 'Final Cut', value: 70 },
  { genre: 'Figma', value: 95 },
  { genre: 'Sketch', value: 45 },
];

const ageData = [
  { name: '0-12', value: 35, color: '#6B8EFF' },
  { name: '13-17', value: 15, color: '#FF9871' },
  { name: '26-40', value: 12, color: '#FFD666' },
  { name: '18-25', value: 25, color: '#B37FEB' },
  { name: '41-60', value: 8, color: '#FF6B72' },
  { name: '60+', value: 5, color: '#8C8C8C' },
];

const topBooks = [
  {
    id: 1,
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&h=160&fit=crop',
    title: 'English 7',
    loans: 150
  },
  {
    id: 2,
    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=120&h=160&fit=crop',
    title: 'Have fun learning English',
    loans: 120
  }
];

export default function Dashboard() {
  const statCards = [
    { title: 'Total books', value: '178+', icon: <BookOutlined />, color: '#E6F4FF', iconColor: '#1890FF' },
    { title: 'Total readers', value: '20+', icon: <UserOutlined />, color: '#E6FFFB', iconColor: '#52C41A' },
    { title: 'Overdue books', value: '190+', icon: <ClockCircleOutlined />, color: '#FFF1F0', iconColor: '#FF4D4F' },
    { title: 'Total books borrowed', value: '12+', icon: <ReadOutlined />, color: '#F0E6FF', iconColor: '#722ED1' },
  ];

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
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Readership chart by age" className="chart-card">
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
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card title="Number of books by genre" className="chart-card">
              <div className="year-badge">2025</div>
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
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Top most borrowed books" className="chart-card">
              <div className="books-list">
                {topBooks.map((book) => (
                  <div key={book.id} className="book-item">
                    <img src={book.cover} alt={book.title} className="book-cover" />
                    <div className="book-info">
                      <div className="book-title">{book.title}</div>
                      <div className="book-loans">Number of loans : {book.loans}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}