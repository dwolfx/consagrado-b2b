import React, { useState } from 'react';
import { FileSpreadsheet, Upload, Download } from 'lucide-react';

const MenuImporter = ({ onDownloadTemplate }) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('idle');

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (file) => {
        setUploadStatus('uploading');
        // Mock upload simulation
        setTimeout(() => {
            setUploadStatus('success');
            // Here we would actually parse the CSV and call an onImport function
            alert('Funcionalidade de processamento de CSV simulada.');
        }, 1500);
    };

    return (
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: 'var(--radius)', textAlign: 'center' }}>
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                    <FileSpreadsheet size={30} className="text-primary" />
                </div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Importação em Massa</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Arraste seu arquivo CSV ou clique para selecionar.
                </p>

                {/* Drag and Drop Area */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    style={{
                        border: '2px dashed var(--glass-border)',
                        borderRadius: '12px',
                        padding: '3rem',
                        backgroundColor: dragActive ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                        transition: 'all 0.2s',
                        marginBottom: '2rem'
                    }}
                >
                    <Upload size={40} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                    <p>Solte o arquivo aqui</p>
                </div>

                <button onClick={onDownloadTemplate} className="btn" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    <Download size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Baixar Modelo CSV
                </button>
            </div>
        </div>
    );
};

export default MenuImporter;
