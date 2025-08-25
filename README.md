# stock-Microservice
# NestJS Microservices Project with RabbitMQ and MySQL

This project consists of two NestJS services:

- `api-service`: REST API that communicates with a worker using RabbitMQ using JWT authentication.
- `stock-worker`: Microservice that listens to RabbitMQ messages and performs logic.
- `rabbitmq`: Used as a transport layer for inter-service communication.
- `mysql`: Stores user and stock data.

---

## 📦 Project Structure

```
root/
├── docker-compose.yml
├── mysql-init/
├── api-service/
│   └── src/
├── stock-worker/
│   └── src/
```

---

## 🚀 Running the Entire Project with Docker

To run everything (`api-service`, `stock-worker`, `rabbitmq`, and `mysql`):

```bash
docker compose up --build
```

This will:

- Build and start both services with debugging support
- Expose:
  - API service at: `http://localhost:3000`
  - RabbitMQ UI at: `http://localhost:15672` (user: `guest`, pass: `guest`)
  - MySQL at: `localhost:3306` (user:`root` password:`admin`)

---

## 🐇 Accessing RabbitMQ Web Interface

After running `docker-compose`:

- Go to [http://localhost:15672](http://localhost:15672)
- Username: `guest`
- Password: `guest`

You can inspect queues, messages, and consumers here.

---

## ⚙️ Running Only RabbitMQ and MySQL

To run only the infrastructure (without Nest services):

```bash
docker compose up rabbitmq mysql
```

---

## 🧪 Running `api-service` Locally

Install dependencies:

```bash
cd api-service
npm install
```

Run locally with hot-reload:

```bash
npm run start:dev
```

Make sure you have `rabbitmq` and `mysql` running (via Docker or locally).

---

## 🧪 Running `stock-worker` Locally

Install dependencies:

```bash
cd stock-worker
npm install
```

Run locally with hot-reload:

```bash
npm run start:dev
```

---

## 🐳 Debugging in VSCode (for both services)

Both services expose debug ports:

- `api-service`: 9229
- `stock-worker`: 9230

To attach the debugger:

1. Open VSCode
2. Use this `launch.json` config:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API Service",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "protocol": "inspector",
      "skipFiles": ["<node_internals>/**"],
      "localRoot": "${workspaceFolder}/api-service",
      "remoteRoot": "/app"
    },
    {
      "name": "Debug Stock Worker",
      "type": "node",
      "request": "attach",
      "port": 9230,
      "restart": true,
      "protocol": "inspector",
      "skipFiles": ["<node_internals>/**"],
      "localRoot": "${workspaceFolder}/stock-worker",
      "remoteRoot": "/app"
    }
  ]
}
```

---

## 🔄 Notes on Auto Reload (Hot Reload)

To ensure hot reload works when using Docker:

- Use `command: npm run start:dev` for development (instead of `node` directly).
- Make sure `volumes` mount local code to `/app` and `working_dir: /app` is set.
- If using `--inspect`, manually restart Docker container on code changes (or use `nodemon` with inspector).

---

## 🧪 Testing RabbitMQ Communication

To send a message from `api-service` to `stock-worker`:

```ts
await this.rabbitService.sendMessage('stock_symbol', 'AAPL');
```

In `stock-worker`, you should have:

```ts
@MessagePattern('stock_symbol')
handleStockRequest(symbol: string) {
  console.log('Received symbol:', symbol);
  return { price: 123.45 };
}
```

Use Postman or curl:

```bash
curl http://localhost:3000/stocks/AAPL
```

---


## 📘 Swagger API Documentation

The API includes integrated Swagger documentation for easy inspection, testing, and exploration of available endpoints.

### 🔗 Swagger URL

Once the `api-service` is running (via Docker or locally), you can access Swagger UI at:

```
http://localhost:3000/api
```

> **Note**: If you prefer the full Swagger JSON spec, it's available at:
```
http://localhost:3000/api-json
```

### 🔐 Authenticated Endpoints

Some endpoints are protected with JWT authentication (e.g. `/auth/private`, `/stock`). You can:

1. Use the `/auth/login` or `/auth/register` endpoint to obtain a token.
2. Click the `Authorize` button (🔒) in the Swagger UI.
3. Enter your JWT token in the format:

```
Bearer <your-token-here>
```

### 📦 Enabled Endpoints

- **POST** `/auth/register` – Register a new user.
- **POST** `/auth/login` – Log in with username/password.
- **GET** `/auth/private` – Protected route (requires JWT).
- **GET** `/stock?q=SYMBOL` – Get stock info for a given symbol (requires JWT).

### 🛠️ Developer Notes

Swagger is initialized in `main.ts`:

```ts
const config = new DocumentBuilder()
  .setTitle('Stock Microservice API')
  .setDescription('API for handling authentication and stock queries')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

---

## 📥 Environment Variables

Example `.env` file for `api-service`:

```env
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=admin
DB_NAME=stock
```

---

## 📄 License

MIT
