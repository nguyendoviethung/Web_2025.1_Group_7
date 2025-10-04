export default function Dashboard() {
  return (
    <div>
      <h1>📊 Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3>📚 Tổng số sách</h3>
          <p style={{ fontSize: '2rem', margin: '10px 0', color: '#3498db' }}>1,234</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3>👥 Tổng số độc giả</h3>
          <p style={{ fontSize: '2rem', margin: '10px 0', color: '#e74c3c' }}>567</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3>📖 Sách đang mượn</h3>
          <p style={{ fontSize: '2rem', margin: '10px 0', color: '#f39c12' }}>89</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3>⏰ Sách quá hạn</h3>
          <p style={{ fontSize: '2rem', margin: '10px 0', color: '#e67e22' }}>12</p>
        </div>
      </div>
    </div>
  );
}