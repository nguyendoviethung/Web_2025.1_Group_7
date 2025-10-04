
export default function ReaderManagement() {
  return (
    <div>
      <h1>👥 Quản lý Độc giả</h1>
      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Danh sách độc giả</h2>
          <button style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
            ➕ Thêm độc giả mới
          </button>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Mã độc giả</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Họ và tên</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Số điện thoại</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Ngày đăng ký</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>RD001</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Trần Thị B</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>tranthib@email.com</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>0123456789</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>15/01/2024</td>
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
