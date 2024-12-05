import React from 'react';

interface JsonViewProps {
    data: any;
    isExpanded: boolean;
}

const JsonView: React.FC<JsonViewProps> = ({ data, isExpanded }) => {
    if (!isExpanded) {
        return <div className="json-preview">
            {data.items?.length || 0} items, 
            Total: ${data.total_amount?.toFixed(2) || '0.00'}
        </div>;
    }

    return (
        <pre className="json-view">
            {JSON.stringify(data, null, 2)}
        </pre>
    );
};

export default JsonView;