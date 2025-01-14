import mysql from 'mysql2'
import dotenv from 'dotenv'
import { Connection } from 'mysql2/typings/mysql/lib/Connection';
import { VercelRequest, VercelResponse } from '@vercel/node';


dotenv.config();

const db: Connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})



export default async function handler(req: VercelRequest, res: VercelResponse) {
    const allowedOrigin = "*";
    const origin = req.headers.origin;

    if (req.method === 'OPTIONS'){
        res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.status(200).end();
    }


    if (origin === allowedOrigin) {
        res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')


    if (req.method === 'POST') {
        res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        console.log("La ruta esta siendo ejecutada")
        const {value, nombre, apellido, email, telefono, mensaje} = req.body
        let query: string;
        let values: any[];
        const dbname = process.env.DB_NAME
        const dbtable = process.env.DB_TABLE

        db.connect((err) => {
    if (err) {
        console.error("Fallo en la conexion a la database", err)
    } else {
        console.log("Conexion exitosa a la database")
    }
})

        if (telefono) {
            query = `INSERT INTO ${dbname}.${dbtable} (value, nombre, apellido, email, telefono, mensaje) VALUES (?, ?, ?, ?, ?, ?)`
            values = [value, nombre, apellido, email, telefono, mensaje]
        } else {
            query = `INSERT INTO ${dbname}.${dbtable} (value, nombre, apellido, email, mensaje) VALUES (?, ?, ?, ?, ?)`
            values = [value, nombre, apellido, email, mensaje]
        }
        
        try{ 
            db.query(query, values, (err) => {
            if (err) {
                console.error("Hubo un error al intentar guardar los datos", err);
                res.status(500).send("Error al intentar guardar los datos");
            } else {
                console.log("Datos guardados exitosamente en la database");
                res.status(200).send("Datos enviados con exito")
            }
        })

        } catch (err) {
            console.error("Error en el procedimiento", err);
            res.status(500).send("No se han podido enviar los datos correctamente")
        }
    } else {
        res.status(405).send('Metodo no permitido');
    }
}