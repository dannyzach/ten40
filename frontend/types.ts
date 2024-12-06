export interface Receipt {
    id: number;
    image_path: string;
    original_filename: string;
    uploaded_at: string;
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