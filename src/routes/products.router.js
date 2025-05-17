import { Router } from "express";
import multer from "multer"; // Importar multer para manejar archivos
import Product from "../models/product.model.js";

// Configuración de multer para manejar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nombre único del archivo
  },
});
const upload = multer({ storage });

const productsRouter = Router();

// Obtener todos los productos con paginación, filtros y ordenamiento
productsRouter.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, query = "", sort = "" } = req.query;

    const limitParsed = Math.max(parseInt(limit), 1); // Asegurar que sea un número positivo
    const pageParsed = Math.max(parseInt(page), 1);
    const sortOrder = sort === "asc" ? 1 : sort === "desc" ? -1 : null;

    const filters = {};
    if (query) {
      filters.$or = [{ category: query }, { status: query === "available" }];
    }

    const products = await Product.paginate(filters, {
      limit: limitParsed,
      page: pageParsed,
      sort: sortOrder ? { price: sortOrder } : undefined,
    });

    res.status(200).json({
      status: "success",
      payload: products.docs,
      totalPages: products.totalPages,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.hasPrevPage ? `/products?page=${products.prevPage}` : null,
      nextLink: products.hasNextPage ? `/products?page=${products.nextPage}` : null,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error.message);
    res.status(500).json({ status: "error", message: "Error al obtener los productos." });
  }
});

// Obtener un producto por ID
productsRouter.get("/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }
    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    console.error("Error al obtener el producto:", error.message);
    res.status(500).json({ message: "Error al obtener el producto." });
  }
});

// Agregar un producto con validación
productsRouter.post("/", upload.single("thumbnail"), async (req, res) => {
  try {
    const { title, description, code, price, stock, category } = req.body;

    // Validar campos obligatorios
    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ message: "Todos los campos obligatorios deben estar presentes." });
    }

    // Validar que los valores numéricos sean válidos
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ message: "El precio debe ser un número mayor que 0." });
    }
    if (isNaN(stock) || stock < 0) {
      return res.status(400).json({ message: "El stock debe ser un número mayor o igual que 0." });
    }

    const newProduct = new Product({
      title,
      description,
      code,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : null, // Guardar la ruta del archivo
    });

    await newProduct.save();
    res.status(201).json({ status: "success", payload: newProduct });
  } catch (error) {
    console.error("Error al agregar el producto:", error.message);
    res.status(500).json({ message: "Error al agregar el producto." });
  }
});

// Actualizar un producto con validación
productsRouter.put("/:pid", async (req, res) => {
  try {
    const { title, price, stock, thumbnail, category, description } = req.body;

    // Al menos un campo debe estar presente
    if (!title && !price && !stock && !thumbnail && !category && !description) {
      return res.status(400).json({ message: "Debe proporcionar al menos un campo para actualizar" });
    }

    // Validar valores numéricos si están presentes
    if (price !== undefined && (isNaN(price) || price <= 0)) {
      return res.status(400).json({ message: "El precio debe ser un número mayor que 0." });
    }
    if (stock !== undefined && (isNaN(stock) || stock < 0)) {
      return res.status(400).json({ message: "El stock debe ser un número mayor o igual que 0." });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.pid,
      { title, price, stock, thumbnail, category, description },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }

    res.status(200).json({ status: "success", payload: updatedProduct });
  } catch (error) {
    console.error("Error al actualizar el producto:", error.message);
    res.status(500).json({ message: "Error al actualizar el producto." });
  }
});

// Eliminar un producto
productsRouter.delete("/:pid", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.pid);
    if (!deletedProduct) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }
    res.status(204).end();
  } catch (error) {
    console.error("Error al eliminar el producto:", error.message);
    res.status(500).json({ message: "Error al eliminar el producto." });
  }
});

export default productsRouter;