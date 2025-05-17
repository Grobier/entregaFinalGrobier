import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectMongoDB from "./config/db.js";
import viewsRouter from "./routes/views.router.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import Product from "./models/product.model.js";

// Configuración inicial
dotenv.config(); // Cargar variables de entorno
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Definir rutas y estructura de directorios
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conexión a MongoDB
connectMongoDB();

// Configuración de Handlebars
app.engine(
  "handlebars",
  engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
    helpers: {
      json: (context) => JSON.stringify(context, null, 2),
      isExternalUrl: (url) => {
        if (typeof url !== 'string') return false;
        return url.startsWith('http://') || url.startsWith('https://');
      },
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({ extended: true })); // Procesar datos de formularios
app.use(express.json()); // Procesar JSON en solicitudes

// Configuración de rutas
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// WebSocket para manejar actualizaciones en tiempo real
let productsCache = []; // Cache local de productos

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  // Enviar productos actuales al cliente
  socket.emit("product-list", productsCache);

  // Escuchar eventos para añadir un producto
  socket.on("newProduct", async (productData) => {
    try {
      const newProduct = new Product(productData);
      await newProduct.save();
      productsCache.push(newProduct); // Actualizar cache local
      io.emit("productAdded", newProduct); // Emitir el nuevo producto a todos los clientes
    } catch (error) {
      console.error("Error al añadir el producto", error);
    }
  });

  // Escuchar eventos para eliminar un producto
  socket.on("deleteProduct", async (productId) => {
    try {
      await Product.findByIdAndDelete(productId); // Eliminar de la base de datos
      productsCache = productsCache.filter((product) => product._id.toString() !== productId); // Actualizar cache local
      io.emit("productDeleted", productId); // Emitir la eliminación a todos los clientes
    } catch (error) {
      console.error("Error al eliminar el producto", error);
    }
  });

  // Manejar desconexiones
  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

// Inicializar productos en el cache al iniciar el servidor
(async () => {
  try {
    productsCache = await Product.find(); // Cargar productos desde la base de datos
  } catch (error) {
    console.error("Error al cargar productos en el inicio:", error);
  }
})();

// Iniciar el servidor
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});