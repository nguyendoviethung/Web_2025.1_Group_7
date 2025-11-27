import React from "react";
import { Button } from "antd";

export default function PageHeader({ title, description, extra }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
            }}
        >
            <div>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
                    {title}
                </h1>
                {description && (
                    <p style={{ margin: "4px 0 0", color: "#666" }}>
                        {description}
                    </p>
                )}
            </div>
            {extra && <div>{extra}</div>}
        </div>
    );
}
