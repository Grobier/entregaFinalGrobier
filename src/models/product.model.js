import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
  title: { type: String, unique: true, required: true }, // Campo obligatorio
  description: { type: String, index: "text", required: true }, // Campo obligatorio
  thumbnail: { type: String, required: false }, // Opcional
  code: { type: String, required: true }, // Campo obligatorio
  price: { type: Number, required: true }, // Campo obligatorio
  stock: { type: Number, required: true }, // Campo obligatorio
  category: { type: String, index: true, required: true }, // Campo obligatorio
  thumbnails: [String], // Opcional: Array de URLs de imágenes
  status: {
    type: Boolean,
    default: true,
    required: false, // Opcional
  },
  tags: { type: Array }, // Opcional
  created_at: { type: Date, default: Date.now() }, // Generado automáticamente
});

// Habilitamos el plugin de paginación para nuestros productos
productSchema.plugin(paginate);

const Product = mongoose.model("Product", productSchema);

export default Product;