import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.URI_MONGODB, {
      useNewUrlParser: true, // Usar el nuevo analizador de URL
      useUnifiedTopology: true, // Usar el motor de topología unificada
      serverSelectionTimeoutMS: 10000, // Tiempo máximo para conectar (10 segundos)
    });
    console.log("✅ Conectado con MongoDB");
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB:", error.message);
    // Detener la aplicación si no se puede conectar a la base de datos
    process.exit(1);
  }
};

export default connectMongoDB;