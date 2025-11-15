# Charan's Wealth Tracker

This is a comprehensive, self-hosted personal finance tracker with dashboards, goal planning, and an AI assistant.

## Production-Ready Setup

This application has been configured with a professional build system (Vite) and a Dockerfile to make it production-ready and easy to deploy.

### Why the Change?

The original application relied on a development-only setup where `.tsx` files were served directly to the browser. This is not suitable for a live, production environment as it's slow, insecure, and not supported by standard web servers.

We've introduced a **build step** that compiles, transpiles, and bundles all the code into highly optimized, static HTML, CSS, and JavaScript files. This is the standard practice for modern web applications.

## How to Run the Application

You can run the application locally for development or build a production version using Docker.

### Prerequisites

You must have [Node.js](https://nodejs.org/) (version 18 or newer) and [Docker](https://www.docker.com/products/docker-desktop/) installed on your machine.

### Local Development

1.  **Install dependencies:**
    Open your terminal in the project root and run:
    ```bash
    npm install
    ```

2.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start a fast development server, typically at `http://localhost:5173`.

### Production Build with Docker

This is the recommended way to run the application in production.

1.  **Build the Docker image:**
    From the project root, run:
    ```bash
    docker build -t wealth-tracker .
    ```
    This command will build the application and package it into a lightweight Nginx container.

2.  **Run the Docker container:**
    ```bash
    docker run -d -p 8080:80 --name my-wealth-tracker wealth-tracker
    ```
    - `-d`: Runs the container in detached mode (in the background).
    - `-p 8080:80`: Maps port 8080 on your local machine to port 80 inside the container.
    - `--name my-wealth-tracker`: Gives your container a memorable name.

3.  **Access the application:**
    Open your web browser and navigate to `http://localhost:8080`. Your wealth tracker is now live!
