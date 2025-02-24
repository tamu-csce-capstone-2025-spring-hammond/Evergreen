# To Run Database locally, follow below steps:

### **1. Install Docker**
Make sure Docker is installed on your system. You can download it from [Docker's website](https://www.docker.com/get-started).

---

### **2. Pull the PostgreSQL Docker Image**
Run the following command to pull the latest PostgreSQL image:

```sh
docker pull postgres
```

---

### **3. Run a PostgreSQL Container**
Execute the following command to create and start a PostgreSQL container:

```sh
docker run --name evergreen_database -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=password -e POSTGRES_DB=evergreen_db -p 5432:5432 -d postgres
```

---

### **4. Verify the Running Container**
Check if the container is running:

```sh
docker ps
```

---

### **5. Install PostgreSQL**
[PostgreSQL Installation Instructions](https://www.postgresql.org/download/)

---

### **6. Connect to the PostgreSQL Database**

```sh
psql -h localhost -p 5432-U myuser -d evergreen_db
```

It will prompt you for the password (`password`).

---

### ***7. Run database script***
To run a database script run:
```sh
\i ..../database/databaseSetup.sql
```

---

### ***8. Run database script***
To run a database script run:
```sh
\i ..../database/databaseSetup.sql
```

---

### **9. Stop and Remove the Container (If Needed)**
To stop the running PostgreSQL container (note this will delete all data):

```sh
docker stop my_postgres
```

To remove the container:

```sh
docker rm my_postgres
```