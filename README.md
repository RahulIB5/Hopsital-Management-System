# Healthcare-Patient-Management-System 

- **Type:** Web-based application

- **Purpose:**
  - Streamline patient care and hospital administration
  - Efficiently manage patient records, appointments, medical histories, and treatment plans

- **Tech Stack:**
  - **Frontend:** React (for a responsive UI)
  - **Backend:** FastAPI (high-performance and lightweight)
  - **ORM:** Prisma
  - **Database:** PostgreSQL (robust and reliable)

- **Key Features:**
  - Real-time appointment scheduling
  - Multi-channel patient notifications (via email and SMS)
  - Scalable and secure for small to medium-sized healthcare facilities

- **SDG Alignment:**
  - Supports **Sustainable Development Goal 3: Good Health and Well-being**
    - **Target 3.2:** Reducing preventable deaths
    - **Target 3.8:** Achieving universal health coverage

---

- FrontEnd

```sh
cd Frontend
```

1. Install dependanccies and assets
```
npm install
```

2. Start server
```
npm run dev
```

---

- Backend

```sh
cd Backend
```

1. Create virtual environment
```
python -m venv venv
```

2. Activate virtual environment
```
venv\Scripts\activate
```

3. Install requirements
```
pip install -r requirements.txt
```

4. Generate Prisma assets
```
prisma generate
```

5. Start uvicorn server
```
uvicorn app.main:app --reload
```


