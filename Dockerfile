# Step 1: Use Amazon Linux 2 as base image
FROM amazonlinux:2023

# Step 2: Set working directory
WORKDIR /app

# Step 3: Install necessary dependencies
RUN yum update -y && \
    yum install -y --allowerasing \
    git \
    curl \
    nodejs \
    npm

# Step 4: Copy application code into the container
COPY backend/package.json /app/package.json


# Step 5: Install Node.js dependencies
RUN npm install

# Step 6: Expose the port that the app will run on
EXPOSE 3000

# Step 7: Command to start the application
CMD ["npm", "start"]
