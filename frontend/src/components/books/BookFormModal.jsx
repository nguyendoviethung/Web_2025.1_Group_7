import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select } from "antd";

const { TextArea } = Input;

export default function BookFormModal({
    visible,
    editingBook,
    onSubmit,
    onCancel,
}) {
    const [form] = Form.useForm();

    const languages = ["English", "Spanish", "French", "German", "Chinese"];

    useEffect(() => {
        if (visible && editingBook) {
            form.setFieldsValue(editingBook);
        } else if (visible) {
            form.resetFields();
            form.setFieldsValue({
                PublicationYear: new Date().getFullYear(),
                Language: "English",
                Pages: 0,
            });
        }
    }, [visible, editingBook, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            onSubmit(values);
            form.resetFields();
        });
    };

    return (
        <Modal
            title={editingBook ? "Edit Book" : "Add New Book"}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            width={800}
            okText={editingBook ? "Save Changes" : "Add Book"}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    PublicationYear: new Date().getFullYear(),
                    Language: "English",
                    Pages: 0,
                }}
            >
                <Form.Item
                    name="Title"
                    label="Title"
                    rules={[
                        { required: true, message: "Please enter book title" },
                    ]}
                >
                    <Input placeholder="Enter book title" />
                </Form.Item>

                <Form.Item
                    name="ISBN"
                    label="ISBN"
                    rules={[{ required: true, message: "Please enter ISBN" }]}
                >
                    <Input placeholder="978-0-XXXX-XXXX-X" />
                </Form.Item>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                    }}
                >
                    <Form.Item name="PublisherName" label="Publisher">
                        <Input placeholder="Publisher name" />
                    </Form.Item>

                    <Form.Item name="PublicationYear" label="Publication Year">
                        <InputNumber
                            style={{ width: "100%" }}
                            min={1000}
                            max={2100}
                        />
                    </Form.Item>

                    <Form.Item name="Edition" label="Edition">
                        <Input placeholder="e.g., 1st, 2nd, Revised" />
                    </Form.Item>

                    <Form.Item name="Language" label="Language">
                        <Select>
                            {languages.map((lang) => (
                                <Select.Option key={lang} value={lang}>
                                    {lang}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="Pages" label="Pages">
                        <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>
                </div>

                <Form.Item name="Description" label="Description">
                    <TextArea rows={4} placeholder="Enter book description" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
