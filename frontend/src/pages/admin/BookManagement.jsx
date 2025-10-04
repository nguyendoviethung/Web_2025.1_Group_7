
export default function BookManagement() {
  return (
    <div>
      <h1>📚 Quản lý Sách</h1>
      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Danh sách sách</h2>
          <button style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
            ➕ Thêm sách mới
          </button>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Mã sách</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tên sách</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tác giả</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Thể loại</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Trạng thái</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>BK001</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Lập trình React</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Nguyễn Văn A</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Công nghệ</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                  <span style={{ background: '#2ecc71', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                    Có sẵn
                  </span>
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                  <button style={{ background: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', marginRight: '5px', cursor: 'pointer' }}>
                    Sửa
                  </button>
                  <button style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                    Xóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
