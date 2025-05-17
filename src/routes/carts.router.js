import { Router } from "express";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";

const cartsRouter = Router();

// Utilidad para validar ObjectIds de MongoDB
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Crear un nuevo carrito vacío
cartsRouter.post("/", async (req, res) => {
  try {
    const cart = new Cart();
    await cart.save();
    res.status(201).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Obtener los productos de un carrito
cartsRouter.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    if (!isValidObjectId(cid)) {
      return res.status(400).json({ status: "error", message: "ID de carrito inválido" });
    }

    const cart = await Cart.findById(cid).populate("products.product");
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Agregar un producto al carrito
cartsRouter.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      return res.status(400).json({ status: "error", message: "ID inválido" });
    }

    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    const existingProduct = cart.products.find((p) => p.product.toString() === pid);
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: pid, quantity });
    }

    await cart.save();
    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Eliminar un producto del carrito
cartsRouter.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      return res.status(400).json({ status: "error", message: "ID inválido" });
    }

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    cart.products = cart.products.filter((p) => p.product.toString() !== pid);
    await cart.save();

    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Eliminar un carrito completo
cartsRouter.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    if (!isValidObjectId(cid)) {
      return res.status(400).json({ status: "error", message: "ID de carrito inválido" });
    }

    const cart = await Cart.findByIdAndDelete(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    res.status(200).json({ status: "success", message: "Carrito eliminado con éxito" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Actualizar la cantidad de un producto en el carrito
cartsRouter.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      return res.status(400).json({ status: "error", message: "ID inválido" });
    }

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    const productIndex = cart.products.findIndex((p) => p.product.toString() === pid);
    if (productIndex === -1) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado en el carrito" });
    }

    // Incrementar o decrementar la cantidad
    cart.products[productIndex].quantity += quantity;

    // Si la cantidad es menor a 1, no permite el cambio
    if (cart.products[productIndex].quantity < 1) {
      return res.status(400).json({ status: "error", message: "Cantidad inválida" });
    }

    await cart.save();
    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Realizar la compra y vaciar el carrito
cartsRouter.post("/:cid/checkout", async (req, res) => {
  try {
    const { cid } = req.params;

    if (!isValidObjectId(cid)) {
      return res.status(400).json({ status: "error", message: "ID de carrito inválido" });
    }

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    if (cart.products.length === 0) {
      return res.status(400).json({ status: "error", message: "El carrito está vacío" });
    }

    cart.products = [];
    await cart.save();

    res.status(200).json({ status: "success", message: "Compra realizada con éxito" });
  } catch (error) {
    console.error("Error al realizar la compra:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default cartsRouter;