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
(Write how to connect to postgreSQL database) 

---

### **6. Connect to the PostgreSQL Database**

```sh
psql -h localhost -U myuser -d evergreen_db
```

It will prompt you for the password (`password`).

---

### ***7. Run Database script***
To run database script run:
```sh
\i ..../database/databaseSetup.sql
```

### **8. Stop and Remove the Container (If Needed)**
To stop the running PostgreSQL container (note this will delete all data):

```sh
docker stop my_postgres
```

To remove the container:

```sh
docker rm my_postgres
```