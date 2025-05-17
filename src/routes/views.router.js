import express from "express";
import Product from "../models/product.model.js"; // Modelo de productos
import Cart from "../models/cart.model.js"; // Modelo de carritos

const router = express.Router();

// Ruta principal (home)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find(); // Obtener los productos desde MongoDB
    res.render("home", { products }); // Renderizar la vista "home" con los productos
  } catch (error) {
    console.error("Error al cargar productos en /:", error);
    res.status(500).render("error", { message: "Error al cargar productos" });
  }
});

// Ruta secundaria (/home)
router.get("/home", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("home", { products });
  } catch (error) {
    console.error("Error al cargar productos en /home:", error);
    res.status(500).render("error", { message: "Error al cargar productos" });
  }
});

// Ruta para productos en tiempo real
router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("realTimeProducts", { products });
  } catch (error) {
    console.error("Error al cargar productos en /realtimeproducts:", error);
    res.status(500).render("error", { message: "Error al cargar productos" });
  }
});

// Ruta para dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const products = await Product.find(); // Obtener productos para el dashboard
    res.render("dashboard", { products, user: { username: "invitado", isAdmin: false } });
  } catch (error) {
    console.error("Error al cargar productos en /dashboard:", error);
    res.status(500).render("error", { message: "Error al cargar productos" });
  }
});

// Ruta para ver todos los carritos
router.get("/carts", async (req, res) => {
  try {
    const carts = await Cart.find().populate("products.product");
    console.log(carts); // Verifica que los datos de los carritos se están obteniendo correctamente
    res.render("carts", { carts });
  } catch (error) {
    console.error("Error al cargar los carritos:", error);
    res.status(500).render("error", { message: "Error al cargar los carritos." });
  }
});

// Ruta para ver un carrito específico
router.get("/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    // Buscar el carrito por ID
    const cart = await Cart.findById(cid).populate("products.product");
    if (!cart) {
      return res.status(404).render("error", { message: "Carrito no encontrado" });
    }

    // Renderizar la vista del carrito
    res.render("cart", { cart }); // Renderiza la vista "cart.handlebars"
  } catch (error) {
    console.error("Error al cargar el carrito:", error);
    res.status(500).render("error", { message: "Error al cargar el carrito" });
  }
});

// Vista para los detalles del producto /products/:pid
router.get("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params; // Obtener el ID del producto desde los parámetros de la URL
    const product = await Product.findById(pid); // Buscar el producto en la base de datos

    if (!product) {
      return res.status(404).render("error", { message: "Producto no encontrado" });
    }

    // Renderizar la vista del detalle del producto
    res.render("productDetail", { product });
  } catch (error) {
    console.error("Error al cargar el detalle del producto:", error);
    res.status(500).render("error", { message: "Error al cargar el producto" });
  }
});

export default router;