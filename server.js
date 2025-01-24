const express = require("express");
const bodyParser = require("body-parser");
const db = require("./firebase"); // Configuración de Firebase
const setupSwaggerDocs = require("./swagger"); // Swagger

const app = express();
app.use(bodyParser.json());

// Configurar Swagger
setupSwaggerDocs(app);

// Ruta raíz
app.get("/", (req, res) => {
    res.send("Bienvenido a la API de la rentadora de máquinas");
});

// **Swagger Documentation para las Entidades**
/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *         correo:
 *           type: string
 *         rol:
 *           type: string
 *         fechaRegistro:
 *           type: string
 *           format: date-time
 *
 *     Maquina:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         precio:
 *           type: number
 *           format: float
 *         distribuidor:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             nombre:
 *               type: string
 *
 *     Alquiler:
 *       type: object
 *       properties:
 *         usuario:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *         maquina:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *         fecha_inicio:
 *           type: string
 *           format: date-time
 *         fecha_fin:
 *           type: string
 *           format: date-time
 *         estado:
 *           type: string
 *
 *     Pago:
 *       type: object
 *       properties:
 *         alquiler_id:
 *           type: string
 *         monto:
 *           type: number
 *           format: float
 *         fecha_pago:
 *           type: string
 *           format: date-time
 *         metodo_pago:
 *           type: string
 *
 *     Distribuidor:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *         correo:
 *           type: string
 *         telefono:
 *           type: string
 *         direccion:
 *           type: string
 */

// **CRUD para Usuarios**

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuario creado con éxito
 */
app.post("/usuarios", async (req, res) => {
    try {
        const { nombre, correo, rol } = req.body;
        if (!nombre || !correo || !rol) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios: nombre, correo y rol." });
        }

        const nuevoUsuario = { nombre, correo, rol, fechaRegistro: new Date().toISOString() };
        const docRef = await db.collection("usuarios").add(nuevoUsuario);
        res.status(201).json({ id: docRef.id, ...nuevoUsuario });
    } catch (error) {
        console.error("Error al crear usuario:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
app.get("/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("usuarios").doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Usuario no encontrado." });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error al obtener usuario:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualizar un usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       200:
 *         description: Usuario actualizado con éxito
 *       404:
 *         description: Usuario no encontrado
 */
app.put("/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo, rol } = req.body;
        const usuarioRef = db.collection("usuarios").doc(id);

        const doc = await usuarioRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Usuario no encontrado." });
        }

        await usuarioRef.update({ nombre, correo, rol });
        res.status(200).json({ mensaje: "Usuario actualizado con éxito" });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado con éxito
 *       404:
 *         description: Usuario no encontrado
 */
app.delete("/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioRef = db.collection("usuarios").doc(id);

        const doc = await usuarioRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Usuario no encontrado." });
        }

        await usuarioRef.delete();
        res.status(200).json({ mensaje: "Usuario eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

// **CRUD para Máquinas**

/**
 * @swagger
 * /maquinas:
 *   post:
 *     summary: Crear una nueva máquina
 *     tags: [Máquinas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Maquina'
 *     responses:
 *       201:
 *         description: Máquina creada con éxito
 */
app.post("/maquinas", async (req, res) => {
    try {
        const { nombre, descripcion, precio, distribuidor } = req.body;
        if (!nombre || !descripcion || !precio || !distribuidor) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios: nombre, descripción, precio y distribuidor." });
        }

        const nuevaMaquina = { nombre, descripcion, precio, distribuidor };
        const docRef = await db.collection("maquinas").add(nuevaMaquina);
        res.status(201).json({ id: docRef.id, ...nuevaMaquina });
    } catch (error) {
        console.error("Error al crear máquina:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /maquinas/{id}:
 *   get:
 *     summary: Obtener una máquina por ID
 *     tags: [Máquinas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la máquina
 *     responses:
 *       200:
 *         description: Máquina encontrada
 *       404:
 *         description: Máquina no encontrada
 */
app.get("/maquinas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("maquinas").doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Máquina no encontrada." });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error al obtener máquina:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /maquinas/{id}:
 *   put:
 *     summary: Actualizar una máquina por ID
 *     tags: [Máquinas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la máquina
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Maquina'
 *     responses:
 *       200:
 *         description: Máquina actualizada con éxito
 *       404:
 *         description: Máquina no encontrada
 */
app.put("/maquinas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, distribuidor } = req.body;
        const maquinaRef = db.collection("maquinas").doc(id);

        const doc = await maquinaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Máquina no encontrada." });
        }

        await maquinaRef.update({ nombre, descripcion, precio, distribuidor });
        res.status(200).json({ mensaje: "Máquina actualizada con éxito" });
    } catch (error) {
        console.error("Error al actualizar máquina:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /maquinas/{id}:
 *   delete:
 *     summary: Eliminar una máquina por ID
 *     tags: [Máquinas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la máquina
 *     responses:
 *       200:
 *         description: Máquina eliminada con éxito
 *       404:
 *         description: Máquina no encontrada
 */
app.delete("/maquinas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const maquinaRef = db.collection("maquinas").doc(id);

        const doc = await maquinaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Máquina no encontrada." });
        }

        await maquinaRef.delete();
        res.status(200).json({ mensaje: "Máquina eliminada con éxito" });
    } catch (error) {
        console.error("Error al eliminar máquina:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

// **CRUD para Alquileres, Pagos, y Distribuidores (similar a lo anterior)**
// **CRUD para Alquileres**

/**
 * @swagger
 * /alquileres:
 *   post:
 *     summary: Crear un nuevo alquiler
 *     tags: [Alquileres]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Alquiler'
 *     responses:
 *       201:
 *         description: Alquiler creado con éxito
 */
app.post("/alquileres", async (req, res) => {
    try {
        const { usuario, maquina, fecha_inicio, fecha_fin, estado } = req.body;

        if (!usuario || !maquina || !fecha_inicio || !fecha_fin || !estado) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios: usuario, máquina, fecha_inicio, fecha_fin, estado." });
        }

        const nuevoAlquiler = { usuario, maquina, fecha_inicio, fecha_fin, estado };
        const docRef = await db.collection("alquileres").add(nuevoAlquiler);
        res.status(201).json({ id: docRef.id, ...nuevoAlquiler });
    } catch (error) {
        console.error("Error al crear alquiler:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /alquileres/{id}:
 *   get:
 *     summary: Obtener un alquiler por ID
 *     tags: [Alquileres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del alquiler
 *     responses:
 *       200:
 *         description: Alquiler encontrado
 *       404:
 *         description: Alquiler no encontrado
 */
app.get("/alquileres/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("alquileres").doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Alquiler no encontrado." });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error al obtener alquiler:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /alquileres/{id}:
 *   put:
 *     summary: Actualizar un alquiler por ID
 *     tags: [Alquileres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del alquiler
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Alquiler'
 *     responses:
 *       200:
 *         description: Alquiler actualizado con éxito
 *       404:
 *         description: Alquiler no encontrado
 */
app.put("/alquileres/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario, maquina, fecha_inicio, fecha_fin, estado } = req.body;
        const alquilerRef = db.collection("alquileres").doc(id);

        const doc = await alquilerRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Alquiler no encontrado." });
        }

        await alquilerRef.update({ usuario, maquina, fecha_inicio, fecha_fin, estado });
        res.status(200).json({ mensaje: "Alquiler actualizado con éxito" });
    } catch (error) {
        console.error("Error al actualizar alquiler:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /alquileres/{id}:
 *   delete:
 *     summary: Eliminar un alquiler por ID
 *     tags: [Alquileres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del alquiler
 *     responses:
 *       200:
 *         description: Alquiler eliminado con éxito
 *       404:
 *         description: Alquiler no encontrado
 */
app.delete("/alquileres/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const alquilerRef = db.collection("alquileres").doc(id);

        const doc = await alquilerRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Alquiler no encontrado." });
        }

        await alquilerRef.delete();
        res.status(200).json({ mensaje: "Alquiler eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar alquiler:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

// **CRUD para Pagos**

/**
 * @swagger
 * /pagos:
 *   post:
 *     summary: Crear un nuevo pago
 *     tags: [Pagos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pago'
 *     responses:
 *       201:
 *         description: Pago realizado con éxito
 */
app.post("/pagos", async (req, res) => {
    try {
        const { alquilerId, monto, metodo, fecha_pago } = req.body;

        if (!alquilerId || !monto || !metodo || !fecha_pago) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios: alquilerId, monto, metodo, fecha_pago." });
        }

        const nuevoPago = { alquilerId, monto, metodo, fecha_pago };
        const docRef = await db.collection("pagos").add(nuevoPago);
        res.status(201).json({ id: docRef.id, ...nuevoPago });
    } catch (error) {
        console.error("Error al crear pago:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /pagos/{id}:
 *   get:
 *     summary: Obtener un pago por ID
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pago
 *     responses:
 *       200:
 *         description: Pago encontrado
 *       404:
 *         description: Pago no encontrado
 */
app.get("/pagos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("pagos").doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Pago no encontrado." });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error al obtener pago:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /pagos/{id}:
 *   put:
 *     summary: Actualizar un pago por ID
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pago
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pago'
 *     responses:
 *       200:
 *         description: Pago actualizado con éxito
 *       404:
 *         description: Pago no encontrado
 */
app.put("/pagos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { alquilerId, monto, metodo, fecha_pago } = req.body;
        const pagoRef = db.collection("pagos").doc(id);

        const doc = await pagoRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Pago no encontrado." });
        }

        await pagoRef.update({ alquilerId, monto, metodo, fecha_pago });
        res.status(200).json({ mensaje: "Pago actualizado con éxito" });
    } catch (error) {
        console.error("Error al actualizar pago:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /pagos/{id}:
 *   delete:
 *     summary: Eliminar un pago por ID
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pago
 *     responses:
 *       200:
 *         description: Pago eliminado con éxito
 *       404:
 *         description: Pago no encontrado
 */
app.delete("/pagos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const pagoRef = db.collection("pagos").doc(id);

        const doc = await pagoRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Pago no encontrado." });
        }

        await pagoRef.delete();
        res.status(200).json({ mensaje: "Pago eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar pago:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

// **CRUD para Distribuidores**

/**
 * @swagger
 * /distribuidores:
 *   post:
 *     summary: Crear un nuevo distribuidor
 *     tags: [Distribuidores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Distribuidor'
 *     responses:
 *       201:
 *         description: Distribuidor creado con éxito
 */
app.post("/distribuidores", async (req, res) => {
    try {
        const { nombre, correo, telefono, direccion } = req.body;

        if (!nombre || !correo || !telefono || !direccion) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios: nombre, correo, telefono, direccion." });
        }

        const nuevoDistribuidor = { nombre, correo, telefono, direccion };
        const docRef = await db.collection("distribuidores").add(nuevoDistribuidor);
        res.status(201).json({ id: docRef.id, ...nuevoDistribuidor });
    } catch (error) {
        console.error("Error al crear distribuidor:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /distribuidores/{id}:
 *   get:
 *     summary: Obtener un distribuidor por ID
 *     tags: [Distribuidores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del distribuidor
 *     responses:
 *       200:
 *         description: Distribuidor encontrado
 *       404:
 *         description: Distribuidor no encontrado
 */
app.get("/distribuidores/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("distribuidores").doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Distribuidor no encontrado." });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error al obtener distribuidor:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /distribuidores/{id}:
 *   put:
 *     summary: Actualizar un distribuidor por ID
 *     tags: [Distribuidores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del distribuidor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Distribuidor'
 *     responses:
 *       200:
 *         description: Distribuidor actualizado con éxito
 *       404:
 *         description: Distribuidor no encontrado
 */
app.put("/distribuidores/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo, telefono, direccion } = req.body;
        const distribuidorRef = db.collection("distribuidores").doc(id);

        const doc = await distribuidorRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Distribuidor no encontrado." });
        }

        await distribuidorRef.update({ nombre, correo, telefono, direccion });
        res.status(200).json({ mensaje: "Distribuidor actualizado con éxito" });
    } catch (error) {
        console.error("Error al actualizar distribuidor:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /distribuidores/{id}:
 *   delete:
 *     summary: Eliminar un distribuidor por ID
 *     tags: [Distribuidores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del distribuidor
 *     responses:
 *       200:
 *         description: Distribuidor eliminado con éxito
 *       404:
 *         description: Distribuidor no encontrado
 */
app.delete("/distribuidores/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const distribuidorRef = db.collection("distribuidores").doc(id);

        const doc = await distribuidorRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Distribuidor no encontrado." });
        }

        await distribuidorRef.delete();
        res.status(200).json({ mensaje: "Distribuidor eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar distribuidor:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

// **CRUD para Reseñas**

/**
 * @swagger
 * /resenas:
 *   post:
 *     summary: Crear una nueva reseña
 *     tags: [Reseñas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Resena'
 *     responses:
 *       201:
 *         description: Reseña creada con éxito
 */
app.post("/resenas", async (req, res) => {
    try {
        const { usuarioId, productoId, calificacion, comentario } = req.body;

        if (!usuarioId || !productoId || !calificacion || typeof comentario === "undefined") {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios: usuarioId, productoId, calificacion, comentario." });
        }

        if (calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ mensaje: "La calificación debe estar entre 1 y 5." });
        }

        const nuevaResena = { usuarioId, productoId, calificacion, comentario };
        const docRef = await db.collection("resenas").add(nuevaResena);
        res.status(201).json({ id: docRef.id, ...nuevaResena });
    } catch (error) {
        console.error("Error al crear reseña:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /resenas/{id}:
 *   get:
 *     summary: Obtener una reseña por ID
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña
 *     responses:
 *       200:
 *         description: Reseña encontrada
 *       404:
 *         description: Reseña no encontrada
 */
app.get("/resenas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("resenas").doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Reseña no encontrada." });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error al obtener reseña:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /resenas/{id}:
 *   put:
 *     summary: Actualizar una reseña por ID
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Resena'
 *     responses:
 *       200:
 *         description: Reseña actualizada con éxito
 *       404:
 *         description: Reseña no encontrada
 */
app.put("/resenas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { usuarioId, productoId, calificacion, comentario } = req.body;
        const resenaRef = db.collection("resenas").doc(id);

        const doc = await resenaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Reseña no encontrada." });
        }

        if (calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ mensaje: "La calificación debe estar entre 1 y 5." });
        }

        await resenaRef.update({ usuarioId, productoId, calificacion, comentario });
        res.status(200).json({ mensaje: "Reseña actualizada con éxito" });
    } catch (error) {
        console.error("Error al actualizar reseña:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /resenas/{id}:
 *   delete:
 *     summary: Eliminar una reseña por ID
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña
 *     responses:
 *       200:
 *         description: Reseña eliminada con éxito
 *       404:
 *         description: Reseña no encontrada
 */
app.delete("/resenas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const resenaRef = db.collection("resenas").doc(id);

        const doc = await resenaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Reseña no encontrada." });
        }

        await resenaRef.delete();
        res.status(200).json({ mensaje: "Reseña eliminada con éxito" });
    } catch (error) {
        console.error("Error al eliminar reseña:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});
/**
 * @swagger
 * /categorias:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [Categorías]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categoria'
 *     responses:
 *       201:
 *         description: Categoría creada con éxito
 */
app.post("/categorias", async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre || !descripcion) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios: nombre, descripcion." });
        }

        const nuevaCategoria = { nombre, descripcion };
        const docRef = await db.collection("categorias").add(nuevaCategoria);
        res.status(201).json({ id: docRef.id, ...nuevaCategoria });
    } catch (error) {
        console.error("Error al crear categoría:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /categorias/{id}:
 *   get:
 *     summary: Obtener una categoría por ID
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       404:
 *         description: Categoría no encontrada
 */
app.get("/categorias/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("categorias").doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Categoría no encontrada." });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error al obtener categoría:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /categorias/{id}:
 *   put:
 *     summary: Actualizar una categoría por ID
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Categoria'
 *     responses:
 *       200:
 *         description: Categoría actualizada con éxito
 *       404:
 *         description: Categoría no encontrada
 */
app.put("/categorias/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        const categoriaRef = db.collection("categorias").doc(id);

        const doc = await categoriaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Categoría no encontrada." });
        }

        await categoriaRef.update({ nombre, descripcion });
        res.status(200).json({ mensaje: "Categoría actualizada con éxito" });
    } catch (error) {
        console.error("Error al actualizar categoría:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /categorias/{id}:
 *   delete:
 *     summary: Eliminar una categoría por ID
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría eliminada con éxito
 *       404:
 *         description: Categoría no encontrada
 */
app.delete("/categorias/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const categoriaRef = db.collection("categorias").doc(id);

        const doc = await categoriaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Categoría no encontrada." });
        }

        await categoriaRef.delete();
        res.status(200).json({ mensaje: "Categoría eliminada con éxito" });
    } catch (error) {
        console.error("Error al eliminar categoría:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});
/**
 * @swagger
 * /ubicaciones:
 *   post:
 *     summary: Crear una nueva ubicación
 *     tags: [Ubicaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ubicacion'
 *     responses:
 *       201:
 *         description: Ubicación creada con éxito
 */
app.post("/ubicaciones", async (req, res) => {
    try {
        const { nombre, direccion, latitud, longitud } = req.body;

        if (!nombre || !direccion || latitud === undefined || longitud === undefined) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios: nombre, direccion, latitud, longitud." });
        }

        const nuevaUbicacion = { nombre, direccion, latitud, longitud };
        const docRef = await db.collection("ubicaciones").add(nuevaUbicacion);
        res.status(201).json({ id: docRef.id, ...nuevaUbicacion });
    } catch (error) {
        console.error("Error al crear ubicación:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /ubicaciones/{id}:
 *   get:
 *     summary: Obtener una ubicación por ID
 *     tags: [Ubicaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ubicación
 *     responses:
 *       200:
 *         description: Ubicación encontrada
 *       404:
 *         description: Ubicación no encontrada
 */
app.get("/ubicaciones/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("ubicaciones").doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Ubicación no encontrada." });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error al obtener ubicación:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /ubicaciones/{id}:
 *   put:
 *     summary: Actualizar una ubicación por ID
 *     tags: [Ubicaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ubicación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ubicacion'
 *     responses:
 *       200:
 *         description: Ubicación actualizada con éxito
 *       404:
 *         description: Ubicación no encontrada
 */
app.put("/ubicaciones/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, direccion, latitud, longitud } = req.body;
        const ubicacionRef = db.collection("ubicaciones").doc(id);

        const doc = await ubicacionRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Ubicación no encontrada." });
        }

        await ubicacionRef.update({ nombre, direccion, latitud, longitud });
        res.status(200).json({ mensaje: "Ubicación actualizada con éxito" });
    } catch (error) {
        console.error("Error al actualizar ubicación:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /ubicaciones/{id}:
 *   delete:
 *     summary: Eliminar una ubicación por ID
 *     tags: [Ubicaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la ubicación
 *     responses:
 *       200:
 *         description: Ubicación eliminada con éxito
 *       404:
 *         description: Ubicación no encontrada
 */
app.delete("/ubicaciones/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const ubicacionRef = db.collection("ubicaciones").doc(id);

        const doc = await ubicacionRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Ubicación no encontrada." });
        }

        await ubicacionRef.delete();
        res.status(200).json({ mensaje: "Ubicación eliminada con éxito" });
    } catch (error) {
        console.error("Error al eliminar ubicación:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /pagos:
 *   post:
 *     summary: Registrar un nuevo pago
 *     tags: [Pagos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pago'
 *     responses:
 *       201:
 *         description: Pago registrado con éxito
 */
app.post("/pagos", async (req, res) => {
    try {
        const { usuarioId, monto, fecha, metodo } = req.body;

        if (!usuarioId || !monto || !fecha || !metodo) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios: usuarioId, monto, fecha, metodo." });
        }

        const nuevoPago = { usuarioId, monto, fecha, metodo };
        const docRef = await db.collection("pagos").add(nuevoPago);
        res.status(201).json({ id: docRef.id, ...nuevoPago });
    } catch (error) {
        console.error("Error al registrar pago:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /pagos/{id}:
 *   get:
 *     summary: Obtener información de un pago por ID
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pago
 *     responses:
 *       200:
 *         description: Pago encontrado
 *       404:
 *         description: Pago no encontrado
 */
app.get("/pagos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("pagos").doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Pago no encontrado." });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error al obtener pago:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /pagos/{id}:
 *   put:
 *     summary: Actualizar un pago por ID
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pago
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pago'
 *     responses:
 *       200:
 *         description: Pago actualizado con éxito
 *       404:
 *         description: Pago no encontrado
 */
app.put("/pagos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { usuarioId, monto, fecha, metodo } = req.body;
        const pagoRef = db.collection("pagos").doc(id);

        const doc = await pagoRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Pago no encontrado." });
        }

        await pagoRef.update({ usuarioId, monto, fecha, metodo });
        res.status(200).json({ mensaje: "Pago actualizado con éxito" });
    } catch (error) {
        console.error("Error al actualizar pago:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /pagos/{id}:
 *   delete:
 *     summary: Eliminar un pago por ID
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pago
 *     responses:
 *       200:
 *         description: Pago eliminado con éxito
 *       404:
 *         description: Pago no encontrado
 */
app.delete("/pagos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const pagoRef = db.collection("pagos").doc(id);

        const doc = await pagoRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Pago no encontrado." });
        }

        await pagoRef.delete();
        res.status(200).json({ mensaje: "Pago eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar pago:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /soporte:
 *   post:
 *     summary: Registrar una nueva solicitud de soporte
 *     tags: [Soporte]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Soporte'
 *     responses:
 *       201:
 *         description: Solicitud de soporte registrada con éxito
 */
app.post("/soporte", async (req, res) => {
    try {
        const { usuarioId, descripcion, fecha, estado } = req.body;

        if (!usuarioId || !descripcion || !fecha || !estado) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios: usuarioId, descripcion, fecha, estado." });
        }

        const nuevaSolicitud = { usuarioId, descripcion, fecha, estado };
        const docRef = await db.collection("soporte").add(nuevaSolicitud);
        res.status(201).json({ id: docRef.id, ...nuevaSolicitud });
    } catch (error) {
        console.error("Error al registrar solicitud de soporte:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /soporte/{id}:
 *   get:
 *     summary: Obtener información de una solicitud de soporte por ID
 *     tags: [Soporte]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de soporte
 *     responses:
 *       200:
 *         description: Solicitud encontrada
 *       404:
 *         description: Solicitud no encontrada
 */
app.get("/soporte/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("soporte").doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Solicitud de soporte no encontrada." });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error al obtener solicitud de soporte:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /soporte/{id}:
 *   put:
 *     summary: Actualizar una solicitud de soporte por ID
 *     tags: [Soporte]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de soporte
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Soporte'
 *     responses:
 *       200:
 *         description: Solicitud actualizada con éxito
 *       404:
 *         description: Solicitud no encontrada
 */
app.put("/soporte/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { usuarioId, descripcion, fecha, estado } = req.body;
        const soporteRef = db.collection("soporte").doc(id);

        const doc = await soporteRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Solicitud de soporte no encontrada." });
        }

        await soporteRef.update({ usuarioId, descripcion, fecha, estado });
        res.status(200).json({ mensaje: "Solicitud actualizada con éxito" });
    } catch (error) {
        console.error("Error al actualizar solicitud de soporte:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /soporte/{id}:
 *   delete:
 *     summary: Eliminar una solicitud de soporte por ID
 *     tags: [Soporte]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de soporte
 *     responses:
 *       200:
 *         description: Solicitud eliminada con éxito
 *       404:
 *         description: Solicitud no encontrada
 */
app.delete("/soporte/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const soporteRef = db.collection("soporte").doc(id);

        const doc = await soporteRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Solicitud de soporte no encontrada." });
        }

        await soporteRef.delete();
        res.status(200).json({ mensaje: "Solicitud eliminada con éxito" });
    } catch (error) {
        console.error("Error al eliminar solicitud de soporte:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /trabajadores:
 *   post:
 *     summary: Registrar un nuevo trabajador
 *     tags: [Trabajadores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trabajador'
 *     responses:
 *       201:
 *         description: Trabajador registrado con éxito
 */
app.post("/trabajadores", async (req, res) => {
    try {
        const { nombre, puesto, salario, fechaContratacion } = req.body;

        if (!nombre || !puesto || !salario || !fechaContratacion) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios: nombre, puesto, salario, fechaContratacion." });
        }

        const nuevoTrabajador = { nombre, puesto, salario, fechaContratacion };
        const docRef = await db.collection("trabajadores").add(nuevoTrabajador);
        res.status(201).json({ id: docRef.id, ...nuevoTrabajador });
    } catch (error) {
        console.error("Error al registrar trabajador:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /trabajadores/{id}:
 *   get:
 *     summary: Obtener información de un trabajador por ID
 *     tags: [Trabajadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del trabajador
 *     responses:
 *       200:
 *         description: Trabajador encontrado
 *       404:
 *         description: Trabajador no encontrado
 */
app.get("/trabajadores/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("trabajadores").doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Trabajador no encontrado." });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error("Error al obtener trabajador:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /trabajadores/{id}:
 *   put:
 *     summary: Actualizar un trabajador por ID
 *     tags: [Trabajadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del trabajador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trabajador'
 *     responses:
 *       200:
 *         description: Trabajador actualizado con éxito
 *       404:
 *         description: Trabajador no encontrado
 */
app.put("/trabajadores/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, puesto, salario, fechaContratacion } = req.body;
        const trabajadorRef = db.collection("trabajadores").doc(id);

        const doc = await trabajadorRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Trabajador no encontrado." });
        }

        await trabajadorRef.update({ nombre, puesto, salario, fechaContratacion });
        res.status(200).json({ mensaje: "Trabajador actualizado con éxito" });
    } catch (error) {
        console.error("Error al actualizar trabajador:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});

/**
 * @swagger
 * /trabajadores/{id}:
 *   delete:
 *     summary: Eliminar un trabajador por ID
 *     tags: [Trabajadores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del trabajador
 *     responses:
 *       200:
 *         description: Trabajador eliminado con éxito
 *       404:
 *         description: Trabajador no encontrado
 */
app.delete("/trabajadores/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const trabajadorRef = db.collection("trabajadores").doc(id);

        const doc = await trabajadorRef.get();

        if (!doc.exists) {
            return res.status(404).json({ mensaje: "Trabajador no encontrado." });
        }

        await trabajadorRef.delete();
        res.status(200).json({ mensaje: "Trabajador eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar trabajador:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});



// Define CRUD para Alquileres, Pagos, y Distribuidores de manera similar al de Usuario y Máquina.

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});
