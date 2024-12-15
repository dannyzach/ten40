export interface Receipt {
    id: number;
    image_path: string;
    original_filename: string;
    uploaded_at: string;
    vendor: string;
    amount: string;
    date: string;
    payment_method: string;
    category: string;
    content: {
        store_name: string;
        date: string;
        items: Array<{
            name: string;
            quantity: number;
            price: number;
        }>;
        subtotal: number;
        tax: number;
        total_amount: number;
    };
}

export interface SearchResult {
    id: string;
    type: string;
    name: string;
    group: string;
}

export interface SearchResultGroup {
    [key: string]: SearchResult[];
} 