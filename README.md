# Chefia (B2B App) 💼

Painel de gestão para gerentes e caixas de bares e restaurantes.

## 🛠️ Tecnologias
- **Frontend**: React (Vite)
- **Backend/Database**: Supabase (PostgreSQL + Realtime)
- **Estilização**: CSS Modules (Vanilla)
- **Icons**: Lucide React

## 🚀 Como Rodar
```bash
# Instalar dependências
npm install

# Rodar localmente
npm run dev

# Build de produção
npm run build
```

---

## 🖥️ Dashboard Operacional
Painel de controle focado em desktop/tablet para o caixa ou gerente.
*   **Acesso Seguro**: Login com credenciais de gerenciamento.

## 🛠️ Funcionalidades
1.  **Mapa de Mesas (Live View)**:
    *   🟢 **Livres** | 🔴 **Ocupadas** | 🟡 **Chamando** (Alerta visual).
    *   *Atualização em Tempo Real via Supabase.*
2.  **Detalhe da Mesa**:
    *   Lista completa de itens consumidos em tempo real.
    *   Botão de **Encerrar/Receber** mesa.
3.  **Gerenciador de Cardápio**:
    *   Adicione, edite e pause produtos (sold out) instantaneamente.
4.  **Fábrica de QR Codes**:
    *   Gere e imprima as plaquinhas de todas as mesas.
5.  **Monitoramento de Staff**:
    *   Widget de **Staff Online** com status em tempo real.
