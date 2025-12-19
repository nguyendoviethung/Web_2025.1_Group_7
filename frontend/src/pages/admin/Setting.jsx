import React, { useState } from 'react';
import { Card, Row, Col, Avatar, Input, Button, Switch, Select, Upload, Divider, Radio, Slider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, BellOutlined, GlobalOutlined, BgColorsOutlined, SafetyOutlined, CameraOutlined, EditOutlined } from '@ant-design/icons';
import '../../style/Settings.scss';

const { TextArea } = Input;
const { Option } = Select;

export default function Setting() {
  const [activeTab, setActiveTab] = useState('profile');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [theme, setTheme] = useState('light');

  const tabs = [
    { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
    { key: 'account', label: 'Account', icon: <LockOutlined /> },
    { key: 'notifications', label: 'Notifications', icon: <BellOutlined /> },
    { key: 'appearance', label: 'Appearance', icon: <BgColorsOutlined /> },
    { key: 'security', label: 'Security', icon: <SafetyOutlined /> },
    { key: 'preferences', label: 'Preferences', icon: <GlobalOutlined /> },
  ];

  const renderProfileSettings = () => (
    <div className="settings-section">
      <Card className="settings-card">
        <div className="section-header">
          <h3>Personal Information</h3>
          <p>Update your personal details and profile picture</p>
        </div>

        <div className="profile-upload">
          <Avatar size={100} src="https://i.pravatar.cc/150?img=68" />
          <div className="upload-actions">
            <Button icon={<CameraOutlined />} type="primary">Change Photo</Button>
            <Button icon={<EditOutlined />}>Remove</Button>
          </div>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div className="form-group">
              <label>First Name</label>
              <Input placeholder="John" prefix={<UserOutlined />} />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="form-group">
              <label>Last Name</label>
              <Input placeholder="Doe" prefix={<UserOutlined />} />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="form-group">
              <label>Email Address</label>
              <Input placeholder="admin@library.com" prefix={<MailOutlined />} />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="form-group">
              <label>Phone Number</label>
              <Input placeholder="+84 123 456 789" prefix={<PhoneOutlined />} />
            </div>
          </Col>
          <Col xs={24}>
            <div className="form-group">
              <label>Bio</label>
              <TextArea rows={4} placeholder="Tell us about yourself..." />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="form-group">
              <label>Role</label>
              <Input value="Administrator" disabled />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="form-group">
              <label>Department</label>
              <Select defaultValue="management" style={{ width: '100%' }}>
                <Option value="management">Management</Option>
                <Option value="library">Library Services</Option>
                <Option value="it">IT Department</Option>
              </Select>
            </div>
          </Col>
        </Row>

        <div className="form-actions">
          <Button>Cancel</Button>
          <Button type="primary">Save Changes</Button>
        </div>
      </Card>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="settings-section">
      <Card className="settings-card">
        <div className="section-header">
          <h3>Account Settings</h3>
          <p>Manage your account credentials and login information</p>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <div className="form-group">
              <label>Username</label>
              <Input placeholder="admin_user" prefix={<UserOutlined />} />
            </div>
          </Col>
          <Col xs={24}>
            <div className="form-group">
              <label>Current Password</label>
              <Input.Password placeholder="Enter current password" prefix={<LockOutlined />} />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="form-group">
              <label>New Password</label>
              <Input.Password placeholder="Enter new password" prefix={<LockOutlined />} />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="form-group">
              <label>Confirm Password</label>
              <Input.Password placeholder="Confirm new password" prefix={<LockOutlined />} />
            </div>
          </Col>
        </Row>

        <Divider />

        <div className="danger-zone">
          <h4>Danger Zone</h4>
          <div className="danger-actions">
            <div className="danger-item">
              <div>
                <strong>Deactivate Account</strong>
                <p>Temporarily disable your account</p>
              </div>
              <Button danger>Deactivate</Button>
            </div>
            <div className="danger-item">
              <div>
                <strong>Delete Account</strong>
                <p>Permanently delete your account and all data</p>
              </div>
              <Button danger type="primary">Delete</Button>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Button>Cancel</Button>
          <Button type="primary">Update Password</Button>
        </div>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <Card className="settings-card">
        <div className="section-header">
          <h3>Notification Preferences</h3>
          <p>Manage how you receive notifications</p>
        </div>

        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-item-info">
              <h4>Email Notifications</h4>
              <p>Receive notifications via email</p>
            </div>
            <Switch checked={emailNotifications} onChange={setEmailNotifications} />
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <h4>Push Notifications</h4>
              <p>Receive push notifications on your device</p>
            </div>
            <Switch checked={pushNotifications} onChange={setPushNotifications} />
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <h4>Book Overdue Alerts</h4>
              <p>Get notified when books are overdue</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <h4>New Reader Registration</h4>
              <p>Notification when new readers register</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <h4>System Updates</h4>
              <p>Receive updates about system maintenance</p>
            </div>
            <Switch />
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <h4>Weekly Reports</h4>
              <p>Get weekly summary of library statistics</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="form-actions">
          <Button>Reset to Default</Button>
          <Button type="primary">Save Preferences</Button>
        </div>
      </Card>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="settings-section">
      <Card className="settings-card">
        <div className="section-header">
          <h3>Appearance Settings</h3>
          <p>Customize the look and feel of your dashboard</p>
        </div>

        <div className="form-group">
          <label>Theme Mode</label>
          <Radio.Group value={theme} onChange={(e) => setTheme(e.target.value)} buttonStyle="solid">
            <Radio.Button value="light">Light</Radio.Button>
            <Radio.Button value="dark">Dark</Radio.Button>
            <Radio.Button value="auto">Auto</Radio.Button>
          </Radio.Group>
        </div>

        <div className="form-group">
          <label>Primary Color</label>
          <div className="color-picker">
            <div className="color-option active" style={{ background: '#6366f1' }}></div>
            <div className="color-option" style={{ background: '#3b82f6' }}></div>
            <div className="color-option" style={{ background: '#8b5cf6' }}></div>
            <div className="color-option" style={{ background: '#ec4899' }}></div>
            <div className="color-option" style={{ background: '#f59e0b' }}></div>
            <div className="color-option" style={{ background: '#10b981' }}></div>
          </div>
        </div>

        <div className="form-group">
          <label>Font Size</label>
          <Slider 
            min={12} 
            max={18} 
            defaultValue={14}
            marks={{ 12: '12px', 14: '14px', 16: '16px', 18: '18px' }}
          />
        </div>

        <div className="form-group">
          <label>Sidebar Width</label>
          <Slider 
            min={200} 
            max={300} 
            defaultValue={240}
            marks={{ 200: '200px', 240: '240px', 280: '280px', 300: '300px' }}
          />
        </div>

        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-item-info">
              <h4>Compact Mode</h4>
              <p>Reduce spacing for more content</p>
            </div>
            <Switch />
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <h4>Show Animations</h4>
              <p>Enable smooth transitions and animations</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="form-actions">
          <Button>Reset to Default</Button>
          <Button type="primary">Apply Changes</Button>
        </div>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <Card className="settings-card">
        <div className="section-header">
          <h3>Security Settings</h3>
          <p>Manage your account security and privacy</p>
        </div>

        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-item-info">
              <h4>Two-Factor Authentication</h4>
              <p>Add an extra layer of security to your account</p>
            </div>
            <Switch checked={twoFactorAuth} onChange={setTwoFactorAuth} />
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <h4>Login Alerts</h4>
              <p>Get notified of new login attempts</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <h4>Session Timeout</h4>
              <p>Automatically log out after inactivity</p>
            </div>
            <Select defaultValue="30" style={{ width: 120 }}>
              <Option value="15">15 minutes</Option>
              <Option value="30">30 minutes</Option>
              <Option value="60">1 hour</Option>
              <Option value="120">2 hours</Option>
            </Select>
          </div>
        </div>

        <Divider />

        <div className="active-sessions">
          <h4>Active Sessions</h4>
          <div className="session-item">
            <div className="session-info">
              <strong>Windows PC - Chrome</strong>
              <p>Hanoi, Vietnam • Last active: 5 minutes ago</p>
            </div>
            <Button size="small">Current Session</Button>
          </div>
          <div className="session-item">
            <div className="session-info">
              <strong>iPhone 14 Pro - Safari</strong>
              <p>Hanoi, Vietnam • Last active: 2 hours ago</p>
            </div>
            <Button size="small" danger>Logout</Button>
          </div>
        </div>

        <div className="form-actions">
          <Button danger>Logout All Devices</Button>
          <Button type="primary">Save Settings</Button>
        </div>
      </Card>
    </div>
  );

  const renderPreferencesSettings = () => (
    <div className="settings-section">
      <Card className="settings-card">
        <div className="section-header">
          <h3>System Preferences</h3>
          <p>Configure system-wide settings</p>
        </div>

        <div className="form-group">
          <label>Language</label>
          <Select defaultValue="en" style={{ width: '100%' }}>
            <Option value="en">English</Option>
            <Option value="vi">Tiếng Việt</Option>
            <Option value="fr">Français</Option>
            <Option value="es">Español</Option>
          </Select>
        </div>

        <div className="form-group">
          <label>Timezone</label>
          <Select defaultValue="asia/hanoi" style={{ width: '100%' }}>
            <Option value="asia/hanoi">Asia/Hanoi (GMT+7)</Option>
            <Option value="asia/tokyo">Asia/Tokyo (GMT+9)</Option>
            <Option value="europe/london">Europe/London (GMT+0)</Option>
            <Option value="america/new_york">America/New York (GMT-5)</Option>
          </Select>
        </div>

        <div className="form-group">
          <label>Date Format</label>
          <Select defaultValue="dd/mm/yyyy" style={{ width: '100%' }}>
            <Option value="dd/mm/yyyy">DD/MM/YYYY</Option>
            <Option value="mm/dd/yyyy">MM/DD/YYYY</Option>
            <Option value="yyyy-mm-dd">YYYY-MM-DD</Option>
          </Select>
        </div>

        <div className="form-group">
          <label>Time Format</label>
          <Radio.Group defaultValue="24">
            <Radio value="12">12-hour (AM/PM)</Radio>
            <Radio value="24">24-hour</Radio>
          </Radio.Group>
        </div>

        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-item-info">
              <h4>Auto-Save</h4>
              <p>Automatically save changes</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <h4>Data Export</h4>
              <p>Allow exporting library data</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="form-actions">
          <Button>Reset All Settings</Button>
          <Button type="primary">Save Preferences</Button>
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileSettings();
      case 'account': return renderAccountSettings();
      case 'notifications': return renderNotificationSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'security': return renderSecuritySettings();
      case 'preferences': return renderPreferencesSettings();
      default: return renderProfileSettings();
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <div className="settings-tabs">
            {tabs.map(tab => (
              <div
                key={tab.key}
                className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-main">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}