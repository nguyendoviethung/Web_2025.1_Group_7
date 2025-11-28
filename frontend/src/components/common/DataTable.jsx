import React from "react";
import { Table, Card } from "antd";

export function DataTable({
    columns,
    dataSource,
    rowKey = "id",
    loading = false,
    pageSize = 10,
    scroll = { x: 1200 },
    ...props
}) {
    return (
        <Card>
            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey={rowKey}
                loading={loading}
                scroll={scroll}
                pagination={{
                    pageSize,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
                {...props}
            />
        </Card>
    );
}
