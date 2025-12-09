
export const products = [
    { id: 1, name: "Heineken 600ml", price: 18.00, category: "Cervejas", stock: 120 },
    { id: 2, name: "Batata Frita", price: 35.00, category: "Porções", stock: 50 },
    { id: 3, name: "Caipirinha", price: 25.00, category: "Drinks", stock: 100 },
];

export const tables = [
    { id: 1, number: 1, status: 'free', items: [] },
    {
        id: 2,
        number: 2,
        status: 'occupied',
        total: 135.00,
        openSince: '20:00',
        items: [
            { id: 'i1', name: 'Heineken 600ml', quantity: 3, price: 18.00 },
            { id: 'i2', name: 'Batata Frita', quantity: 1, price: 35.00 },
            { id: 'i3', name: 'Caipirinha', quantity: 2, price: 25.00 }
        ]
    },
    {
        id: 3,
        number: 3,
        status: 'calling',
        total: 45.00,
        openSince: '21:15',
        items: [
            { id: 'i4', name: 'Batata Frita', quantity: 1, price: 35.00 },
            { id: 'i5', name: 'Coca-Cola', quantity: 2, price: 10.00 } // Item not in products list mock
        ]
    },
    { id: 4, number: 4, status: 'free', items: [] },
    {
        id: 5,
        number: 5,
        status: 'occupied',
        total: 280.50,
        openSince: '19:45',
        items: [
            { id: 'i6', name: 'Combo Vodka + Energético', quantity: 1, price: 250.00 },
            { id: 'i7', name: 'Água sem Gás', quantity: 4, price: 7.625 }
        ]
    },
    { id: 6, number: 6, status: 'free', items: [] },
];
