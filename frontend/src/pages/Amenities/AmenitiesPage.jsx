import React, { useState } from 'react';
import './AmenitiesPage.css';

const AmenitiesPage = () => {
  const [activeTab, setActiveTab] = useState('supplies');

  // Dummy data
  const [supplies, setSupplies] = useState([
    { id: 1, name: 'Khăn tắm lớn', category: 'Phòng tắm', stock: 150, price: 0 },
    { id: 2, name: 'Gối mềm', category: 'Giường ngủ', stock: 80, price: 0 },
    { id: 3, name: 'Dầu gội', category: 'Phòng tắm', stock: 300, price: 0 },
  ]);

  const [minibar, setMinibar] = useState([
    { id: 1, name: 'Nước suối Aquafina', category: 'Đồ uống', stock: 200, price: 20000 },
    { id: 2, name: 'Coca Cola', category: 'Đồ uống', stock: 120, price: 30000 },
    { id: 3, name: 'Snack khoai tây', category: 'Đồ ăn', stock: 50, price: 45000 },
  ]);

  const [inventory, setInventory] = useState([
    { roomNumber: '101', towels: 2, water: 2, pillows: 4, snacks: 1 },
    { roomNumber: '102', towels: 4, water: 4, pillows: 6, snacks: 2 },
    { roomNumber: '201', towels: 2, water: 2, pillows: 2, snacks: 1 },
  ]);

  const renderSupplies = () => (
    <div className="section-content">
      <div className="table-header">
        <h3>Danh Sách Vật Tư Khách Sạn</h3>
        <button className="btn-primary">+ Thêm Vật Tư Mới</button>
      </div>
      <table className="custom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên Vật Tư</th>
            <th>Phân Loại</th>
            <th>Tồn Kho</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {supplies.map(item => (
            <tr key={item.id}>
              <td>#{item.id}</td>
              <td className="fw-bold">{item.name}</td>
              <td><span className="badge category-badge">{item.category}</span></td>
              <td><span className={`badge ${item.stock > 100 ? 'stock-good' : 'stock-low'}`}>{item.stock}</span></td>
              <td>
                <button className="icon-btn edit">✏️</button>
                <button className="icon-btn delete">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMinibar = () => (
    <div className="section-content">
      <div className="table-header">
        <h3>Danh Mục Minibar</h3>
        <button className="btn-primary">+ Thêm Sản Phẩm Mới</button>
      </div>
      <table className="custom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên Sản Phẩm</th>
            <th>Loại</th>
            <th>Giá Bán (VNĐ)</th>
            <th>Tồn Kho</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {minibar.map(item => (
            <tr key={item.id}>
              <td>#{item.id}</td>
              <td className="fw-bold">{item.name}</td>
              <td><span className="badge category-badge minibar-badge">{item.category}</span></td>
              <td className="text-price">{item.price.toLocaleString()} đ</td>
              <td><span className="badge stock-good">{item.stock}</span></td>
              <td>
                <button className="icon-btn edit">✏️</button>
                <button className="icon-btn delete">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderInventory = () => (
    <div className="section-content">
      <div className="table-header">
        <h3>Quản Lý Số Lượng Vật Tư & Minibar Tại Phòng</h3>
        <div className="search-bar">
          <input type="text" placeholder="Tìm số phòng..." />
          <button className="btn-secondary">Tìm kiếm</button>
        </div>
      </div>
      <div className="inventory-grid">
        {inventory.map((item, index) => (
          <div className="room-card" key={index}>
            <div className="room-header">Phòng {item.roomNumber}</div>
            <div className="room-details">
              <div className="detail-item">
                <span>Khăn tắm:</span>
                <input type="number" defaultValue={item.towels} />
              </div>
              <div className="detail-item">
                <span>Gối:</span>
                <input type="number" defaultValue={item.pillows} />
              </div>
              <div className="detail-item">
                <span>Nước suối:</span>
                <input type="number" defaultValue={item.water} />
              </div>
              <div className="detail-item">
                <span>Snack:</span>
                <input type="number" defaultValue={item.snacks} />
              </div>
            </div>
            <button className="btn-update-stock">Cập nhật lưu trữ</button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="amenities-container anim-fade-in">
      <header className="page-header">
        <h1>Quản Lý Vật Tư & Minibar 🛏️🍹</h1>
        <p>Kiểm soát và quản lý danh mục vật tư tiêu hao, sản phẩm minibar và tồn kho theo từng phòng.</p>
      </header>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'supplies' ? 'active' : ''}`}
          onClick={() => setActiveTab('supplies')}
        >🧼 Vật Tư Khách Sạn</button>
        <button 
          className={`tab-btn ${activeTab === 'minibar' ? 'active' : ''}`}
          onClick={() => setActiveTab('minibar')}
        >🍷 Sản Phẩm Minibar</button>
        <button 
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >📦 Quản Lý Tồn Phòng</button>
      </div>

      <div className="tab-content">
        {activeTab === 'supplies' && renderSupplies()}
        {activeTab === 'minibar' && renderMinibar()}
        {activeTab === 'inventory' && renderInventory()}
      </div>
    </div>
  );
};

export default AmenitiesPage;
