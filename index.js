import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import results from './data/agentes.js';

const app = express();

app.listen(3000, () => {
    console.log("Servidor escuchando en http://localhost:3000");
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', (req, res) => {
    let { email, password } = req.body;
    try {
        
        let resultado = results.find(agent => agent.email === email && agent.password === password);

        if (!resultado) {
            return res.status(400).json({
                message: "Las credenciales de acceso no coinciden con ningún usuario."
            });
        }

        let usuario = { email: resultado.email };

        let token = jwt.sign(usuario, "secreto", { expiresIn: '2m' });

        res.json({
            message: "Login exitoso",
            usuario,
            token
        });

    } catch (error) {
        res.status(500).json({
            message: "Error en el proceso de login"
        });
    }
});

app.get("/privada", (req, res) => {
    try {
        let { token } = req.query;

        jwt.verify(token, 'secreto');

        res.sendFile(path.join(__dirname, 'public', 'privada.html'));
    } catch (error) {
        let status = 500;
        let message = "Error al cargar la vista.";
        console.log(error.message);
        if (error.message == "jwt must be provided") {
            status = 400;
            message = "Debe proporcionar un token válido para esta sección de la app.";
        } else if (error.message == "invalid signature") {
            status = 401;
            message = "Debe proporcionar un token válido, intente haciendo nuevamente un login.";
        }
        res.status(status).json({ message });
    }
});



