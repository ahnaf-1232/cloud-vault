# Use official Node.js image as base image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application to the container
COPY . .

# Build the application for production
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Command to run the application in production
CMD ["npm", "run", "start"]