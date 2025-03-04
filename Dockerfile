FROM amazonlinux:2023

WORKDIR /app

# Step 3: Install necessary dependencies
RUN yum update -y && \
    yum install -y --allowerasing \
    git \
    curl \
    nodejs \
    npm

COPY backend/package.json /app/package.json


RUN npm install --verbose

EXPOSE 3000

CMD ["npm", "start"]
