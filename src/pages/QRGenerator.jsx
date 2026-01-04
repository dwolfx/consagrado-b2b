import { tables } from '../data/mockData';
import { QrCode, Printer } from 'lucide-react';

const QRGenerator = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Códigos QR das Mesas</h1>
                <button className="btn btn-primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Printer size={20} /> Imprimir Todos
                </button>
            </div>

            <div className="grid-tables">
                {tables.map(table => (
                    <div key={table.id} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Mesa {table.number}</h3>
                        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                            <QrCode size={120} color="black" />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {`https://consagrado.app/tab/${table.number}`}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QRGenerator;
