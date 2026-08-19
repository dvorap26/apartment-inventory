import { useEffect, useState } from 'react';
import {
  Layout,
  Typography,
  Table,
  Button,
  Upload,
  Input,
  Form,
  Popconfirm,
  message,
  Space,
} from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { InventoryItem } from './services/api';
import { fetchItems, uploadItem, deleteItem } from './services/api';
import 'antd/dist/reset.css';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm<{ name: string; file: { fileList: UploadFile[] } }>();

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } catch {
      message.error('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleUpload = async (values: { name: string; file: { fileList: UploadFile[] } }) => {
    const fileList = values.file?.fileList;
    if (!fileList || fileList.length === 0) {
      message.error('Please select a file');
      return;
    }
    const file = fileList[0].originFileObj as File;
    setUploading(true);
    try {
      await uploadItem(values.name, file);
      message.success('Item uploaded successfully');
      form.resetFields();
      await loadItems();
    } catch {
      message.error('Failed to upload item');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await deleteItem(name);
      message.success('Item deleted');
      await loadItems();
    } catch {
      message.error('Failed to delete item');
    }
  };

  const columns = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: InventoryItem) => (
        <Popconfirm
          title="Delete this item?"
          onConfirm={() => handleDelete(record.name)}
          okText="Yes"
          cancelText="No"
        >
          <Button danger icon={<DeleteOutlined />} size="small">
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          Apartment Inventory Test
        </Title>
      </Header>
      <Content style={{ padding: '24px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <Title level={4}>Upload New Item</Title>
        <Form form={form} layout="inline" onFinish={handleUpload} style={{ marginBottom: 24 }}>
          <Form.Item name="name" rules={[{ required: true, message: 'Item name is required' }]}>
            <Input placeholder="Item name" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item
            name="file"
            rules={[{ required: true, message: 'Please select a file' }]}
            valuePropName="fileWrapper"
            getValueFromEvent={(e) => e}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              onChange={(info) => form.setFieldValue('file', info)}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={uploading}>
                Upload
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Title level={4}>Inventory Items</Title>
        <Table
          columns={columns}
          dataSource={items}
          rowKey="name"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Content>
    </Layout>
  );
}

export default App;
