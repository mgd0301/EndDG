const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require('nodemailer');

// Configuración del transporte de correo (usando Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Usamos el servicio de Gmail
  auth: {
    user: 'zielsoftvm@gmail.com',   // Tu correo de Gmail
    pass: 'agvjuzybksgcjmnm',         // Tu contraseña de Gmail (o contraseña de aplicación)
  },
});



dotenv.config();

const app = express();
const PORT = process.env.PORT;


// Habilitar CORS para todas las solicitudes
app.use(cors({
    origin: "*",  // Permite cualquier origen (para desarrollo, luego puedes restringirlo)
    methods: ["GET", "POST"],  // Métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"]  // Headers permitidos
  }));
  

  

app.use(express.json());

// Configuración del pool de conexiones
const pool = mysql.createPool({


  //host: process.env.DB_HOST,
  //user: process.env.DB_USER,
  //password: process.env.DB_PASS,
  //database: process.env.DB_NAME,
  //port: process.env.DB_PORT || 3306,  // Usar 3306 como valor predeterminado si no se establece el puerto

  host: "maglev.proxy.rlwy.net",
  user: "root",
  password: "QcNybAWYyxOoIgcoriyMDfJYItonwgiT",
  database: "railway",
  port: "18008",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Intentar obtener una conexión para verificar si la base de datos está accesible
pool.getConnection((err, connection) => {



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
    "SELECT id codusuario, nombre, usuario FROM usuarios WHERE usuario = ? AND clave = ? and estado = 'A'",
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


// Endpoint para enviar correo
app.post("/enviar-email", (req, res) => {
  const { nombre, email, mensaje, destinatario } = req.body;

  if (!nombre || !email || !mensaje || !destinatario) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  // Configuración del correo
  const mailOptions = {
    from: email,                      // El correo del que envía el mensaje
    to: destinatario,                 // El correo de destino
    subject: `Nuevo mensaje de ${nombre}`,  // Asunto del correo
    text: mensaje,                    // Cuerpo del mensaje
    html: `<p><strong>De:</strong> ${nombre} <br><strong>Email:</strong> ${email} <br><strong>Mensaje:</strong><br> ${mensaje}</p>`,  // Cuerpo en HTML (opcional)
  };

  // Enviar el correo
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: 'Error al enviar el email', details: error });
    }
    res.json({ mensaje: 'Correo enviado con éxito', info });
  });
});




// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
