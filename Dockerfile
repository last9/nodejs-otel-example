# Use the official Node.js 24 (active LTS) image as a parent image.
# Node 18 is end-of-life and will not receive TLS trust-store fixes.
FROM node:24

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code to the container
COPY . .

CMD [ "node", "app.js" ]
