import React, { useState } from 'react';
import { Input, Avatar, Badge, Button, Tabs } from 'antd';
import { SearchOutlined, PlusOutlined, PhoneOutlined, VideoCameraOutlined, MoreOutlined, SmileOutlined, PaperClipOutlined, SendOutlined } from '@ant-design/icons';
import '../../style/Messages.scss';

const { TextArea } = Input;

const conversationsData = [
  {
    id: 1,
    name: 'Shelby Goode',
    avatar: 'https://i.pravatar.cc/150?img=1',
    message: 'Lorem ipsum is simply dummy text of the printing',
    time: '1 min ago',
    online: true
  },
  {
    id: 2,
    name: 'Robert Bacins',
    avatar: 'https://i.pravatar.cc/150?img=2',
    message: 'Lorem ipsum is simply dummy text of the printing',
    time: '9 min ago',
    online: false
  },
  {
    id: 3,
    name: 'John Carilo',
    avatar: 'https://i.pravatar.cc/150?img=3',
    message: 'Lorem ipsum is simply dummy text of the printing',
    time: '15 min ago',
    online: true
  },
  {
    id: 4,
    name: 'Adriene Watson',
    avatar: 'https://i.pravatar.cc/150?img=4',
    message: 'Lorem ipsum is simply dummy text of the printing',
    time: '21 min ago',
    online: false
  },
  {
    id: 5,
    name: 'Jhon Deo',
    avatar: 'https://i.pravatar.cc/150?img=5',
    message: 'Lorem ipsum is simply dummy text of the printing',
    time: '29 min ago',
    online: false
  },
  {
    id: 6,
    name: 'Mark Ruffalo',
    avatar: 'https://i.pravatar.cc/150?img=6',
    message: 'Lorem ipsum is simply dummy text of the printing',
    time: '45 min ago',
    online: false
  },
  {
    id: 7,
    name: 'Bethany Jackson',
    avatar: 'https://i.pravatar.cc/150?img=7',
    message: 'Lorem ipsum is simply dummy text of the printing',
    time: '1h ago',
    online: false
  }
];

const messagesData = [
  {
    id: 1,
    text: 'Lorem Ipsum is simply',
    sent: true,
    time: '09:25 PM'
  },
  {
    id: 2,
    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    sent: true,
    time: '09:25 PM'
  },
  {
    id: 3,
    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    sent: false,
    time: '09:26 PM',
    images: [
      'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=200&fit=crop'
    ]
  }
];

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(conversationsData[2]);
  const [messageInput, setMessageInput] = useState('');

  const tabItems = [
    { key: 'all', label: 'All' },
    { key: 'personal', label: 'Personal' },
    { key: 'teams', label: 'Teams' }
  ];

  return (
    <div className="messages-container">
      <div className="conversations-panel">
        <div className="panel-header">
          <h2>Message</h2>
          <Button type="primary" shape="circle" icon={<PlusOutlined />} />
        </div>

        <div className="search-box">
          <Input 
            placeholder="Search" 
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            bordered={false}
          />
        </div>

        <Tabs 
          defaultActiveKey="personal" 
          items={tabItems}
          className="conversation-tabs"
        />

        {/*Danh sách bạn bè  */}
        <div className="conversations-list">
          {conversationsData.map(conv => (
            <div 
              key={conv.id}
              className={`conversation-item ${selectedChat.id === conv.id ? 'active' : ''}`}
              onClick={() => setSelectedChat(conv)}
            >
              <Badge dot={conv.online} offset={[-5, 35]} color="#52c41a">
                <Avatar size={48} src={conv.avatar} />
              </Badge>
              <div className="conversation-info">
                <div className="conversation-header">
                  <span className="conversation-name">{conv.name}</span>
                  <span className="conversation-time">{conv.time}</span>
                </div>
                <div className="conversation-message">{conv.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-panel">
        <div className="chat-header">
            {/* Phần avatar và trạng thái hoạt động */}
          <div className="chat-user-info">
            <Badge dot status="success" offset={[-5, 35]}>
              <Avatar size={48} src={selectedChat.avatar} />
            </Badge>
            <div className="user-details">
              <h3>{selectedChat.name}</h3>
              <span className="user-status">Online</span>
            </div>
          </div>

          {/* Phần call video, gọi điện */}
          <div className="chat-actions">
            <Button
                type="text"
                icon={<PhoneOutlined style={{ fontSize: 18 }} />}
            />
            <Button
                type="text"
                icon={<VideoCameraOutlined style={{ fontSize: 18 }} />}
            />
            <Button
                type="text"
                icon={<MoreOutlined style={{ fontSize: 18 }} />}
            />
        </div>
        </div>
        
        {/* Phần tin nhắn hiển thị */}
        <div className="chat-messages">
          {messagesData.map(msg => (
            <div key={msg.id} className={`message-wrapper ${msg.sent ? 'sent' : 'received'}`}>
              {!msg.sent && <Avatar size={32} src={selectedChat.avatar} className="message-avatar" />}
              <div className="message-content">
                {msg.images && (
                  <div className="message-images">
                    {msg.images.map((img, idx) => (
                      <img key={idx} src={img} alt="attachment" />
                    ))}
                  </div>
                )}
                {msg.text && <div className="message-bubble">{msg.text}</div>}
                <span className="message-time">{msg.time}</span>
              </div>
              {msg.sent && <Avatar size={32} src="https://i.pravatar.cc/150?img=20" className="message-avatar" />}
            </div>
          ))}
        </div>
        
        {/* Phần nhập tin nhắn, gửi và đính kèm tệp */}
        <div className="chat-input">
          <Button type="text" icon={<PaperClipOutlined />} />
          <Input 
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            bordered={false}
            suffix={<SmileOutlined style={{ color: '#bfbfbf' }} />}
          />
          <Button type="primary" icon={<SendOutlined />} />
        </div>
      </div>
    </div>
  );
}