const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Configuración del pool de conexiones
const pool = mysql.createPool({


  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,  // Usar 3306 como valor predeterminado si no se establece el puerto
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Intentar obtener una conexión para verificar si la base de datos está accesible
pool.getConnection((err, connection) => {

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);

  if (err) {
    let errorMessage = "Error de conexión a la base de datos";
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = "Error de acceso: usuario o contraseña incorrectos";
    } else if (err.code === 'ENOTFOUND') {
      errorMessage = "Error: no se pudo encontrar el servidor de base de datos";
    } else if (err.code === 'ECONNREFUSED') {
      errorMessage = "Error: conexión rechazada por el servidor";
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      errorMessage = "Error: base de datos no encontrada";
    }
    console.error(errorMessage, err);
    return;
  }

  if (connection) connection.release();
  console.log('Conexión exitosa a la base de datos');
});

// Endpoint de prueba
app.get("/", (req, res) => {
  res.send("API funcionando correctamente");
});

// Endpoint para login (ejemplo básico)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  pool.query(
    "SELECT * FROM usuarios WHERE usuario = ? AND clave = ? and estado = 'A'",
    [username, password],
    (err, results) => {
      if (err) {
        console.error("Error en la consulta:", err);
        return res.status(500).json({
          error: "Error en el servidor",
          details: err.message,  // Agregamos más detalles del error
        });
      }

      if (results.length > 0) {
        res.json({ message: "Login exitoso", user: results[0] });
      } else {
        res.status(401).json({ error: "Credenciales incorrectas" });
      }
    }
  );
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
