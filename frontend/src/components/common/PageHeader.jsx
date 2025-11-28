import React from "react";
import { Row, Col, Typography } from "antd";

const { Title, Text } = Typography;

export function PageHeader({ title, description, extra }) {
    return (
        <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 24 }}
        >
            <Col>
                <Title level={2} style={{ margin: 0, marginBottom: 4 }}>
                    {title}
                </Title>
                {description && <Text type="secondary">{description}</Text>}
            </Col>
            {extra && <Col>{extra}</Col>}
        </Row>
    );
}
