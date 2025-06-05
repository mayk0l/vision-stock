# vision-stock

Sistema web para control de stock y registro de ventas con reconocimiento por IA, pensado para pymes y microempresas chilenas.

---

## Tecnologías usadas

### Frontend

- React 18 + TypeScript  
- Vite (bundler rápido)  
- TailwindCSS (estilos utilitarios)  
- Zustand (estado global)  
- React Router (ruteo SPA)

### Backend

- Node.js + Express  
- TypeScript  
- Prisma ORM (PostgreSQL)  
- JWT para autenticación  
- Zod para validación de datos

### Inteligencia Artificial

- Modelo ML personalizado para reconocimiento de productos con cámara (integrado vía API REST)

### DevOps y despliegue

- GitHub Actions (CI/CD)  
- Vercel (frontend)  
- Railway (backend y base de datos)  

---

## ⚙️ Arquitectura

Este proyecto sigue los principios de **Clean Architecture**, con separación de responsabilidades clara:

\```
Frontend
├── presentation (UI)
├── application (lógica de flujo)
└── infrastructure (APIs, servicios externos)

Backend
├── controllers (rutas)
├── services (lógica de negocio)
├── repositories (acceso a datos con Prisma)
└── middlewares (auth, validaciones, etc)
\```

---

## 📱 Funcionalidades principales (MVP)

- 📷 Escaneo de productos con cámara.  
- 🧠 Reconocimiento automático con IA.  
- 🛒 Agregado rápido a carrito de venta.  
- 📦 Control de stock centralizado en backend.  
- 📝 Registro histórico de ventas.  
- 🔒 Login de trabajador y administradora.  
- 📊 Consulta de stock desde cualquier parte.

---

## 📦 Instalación y uso

### Instala dependencias frontend

\```bash
cd frontend
npm install
\```

### Instala dependencias backend

\```bash
cd ../backend
npm install
\```

### Crea archivo `.env`

Usa el archivo `.env.example` como base para crear tus credenciales de desarrollo.

---

## ▶️ Corre ambos servidores

### Frontend

\```bash
cd frontend
npm run dev
\```

### Backend

\```bash
cd backend
npm run dev
\```

---

## 📄 Documentación técnica

- `/docs/api.md` – Referencia de endpoints del backend.  
- `/docs/vision.md` – Cómo se integra el reconocimiento por IA.  
- `/docs/manual-usuario.pdf` – Guía visual para clientes.

---

## 📢 Estado del proyecto

- 🟡 En desarrollo: fase inicial.  
- 🧪 Actualmente en pruebas reales en un almacén local de Villa Alemana.  
- 📌 Testimonio esperado como primer caso de éxito.

---

## 🤝 Colaborar

Si quieres aportar o probar este sistema para tu negocio:

- Abre un issue.  
- Contáctame por correo: maykol.dev@tucorreo.com

---

## 🧙 Desarrollado por

Maykol Salgado (aka 959maykol)  
Fullstack Developer & Arquitecto de Software para pymes chilenas  
https://maykol.vercel.app

---

## 🧾 Licencia

Este proyecto está bajo licencia **MIT** para uso comercial y privado.
