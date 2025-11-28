import React, { useEffect } from "react";
import { Modal, Form } from "antd";

export function FormModal({
    visible,
    title,
    editMode = false,
    initialValues = {},
    onSubmit,
    onCancel,
    children,
    width = 600,
    okText,
}) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (editMode && Object.keys(initialValues).length > 0) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
        }
    }, [visible, editMode, initialValues, form]);

    const handleOk = () => {
        form.validateFields()
            .then((values) => {
                onSubmit(values);
                form.resetFields();
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={title}
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            width={width}
            okText={okText || (editMode ? "Save Changes" : "Add")}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                style={{ marginTop: 24 }}
            >
                {typeof children === "function" ? children(form) : children}
            </Form>
        </Modal>
    );
}
