import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import {VercelRequest, VercelResponse} from '@vercel/node'

dotenv.config();  // AAgarramos las variables de entorno

const transporter = nodemailer.createTransport({  // El medio para enviar los correos (mi correo basicamente)
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
})


export default async function handler(req: VercelRequest, res: VercelResponse) {
const allowedOrigin = "http://localhost:5173";  // El origen permitido del request
const origin = req.headers.origin  // El origen de la request

if (req.method === 'OPTIONS') {  // Para manejar el preflight y que el CORS no siga jodiendo
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();  // Respond with a 200 for OPTIONS requests
}


if (origin === allowedOrigin) {  // Si el origen de la request es igual al origen permitido lo seteamos en el header como origen permitido
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
}
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');  // Aca seteamos los metodos y headers permitidos 
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

if (req.method === 'POST') {  // Si el metodo es POST
    console.log('La ruta esta siendo ejecutada');
    const {to, subject, html} = req.body  // Desestructuramos el cuerpo de la request

    try {  
        const mailOptions = { // Los datos necesarios para enviar el gmail
            from: process.env.MAIL_USERNAME,
            to: to,
            subject: subject,
            html: html  // Seria el mensaje
        };

        await transporter.sendMail(mailOptions); // Enviamos el email pasando como parametro las mailOptions
        console.log(`Email enviado a: ${to}`)
        res.status(200).send("Correo enviado exitosamente");
    } catch (err) {  // Agarramos el error en caso de que ocurra
        console.error("Error al enviar el correo:", err)  // Respuesta para el back
        res.status(500).send("Error al enviar el correo")  // Respuesta para el front
    }
} else {  // Si no es un POST
    res.status(405).send('Metodo no permitido'); // El error 405 maneja los metodos incorrectos
}

}


// Las serverless functions desplegadas en vercel se van a tardar mas en realizar el proceso que un backend hecho con express debido al "cold start".