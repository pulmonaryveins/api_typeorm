import 'reflect-metadata'; 
import express from 'express';
import cors from 'cors';
import { errorHandler } from './_middleware/error-handler';
import { createConnection } from 'typeorm';
const config = require('./config.json');
import userRoutes from './users/users.controller';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/users', userRoutes);


// Global error handler - place this AFTER all routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    errorHandler(err, req, res, next);
  });

// Set port
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;

// Initialize database and start server
const { host, port: dbPort, user, password, database } = config.database;

// Helper function to ensure database exists
async function ensureDatabase() {
    return new Promise((resolve, reject) => {
        const mysql = require('mysql2');
        const tempConnection = mysql.createConnection({
            host,
            port: dbPort,
            user,
            password
        });

        tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``, (err: any) => {
            tempConnection.end();
            if (err) {
                reject(err);
                return;
            }
            console.log('Database availability checked/created successfully');
            resolve(true);
        });
    });
}

// Start application
async function startApp() {
    try {
        await ensureDatabase();
        
        const connection = await createConnection({
            type: 'mysql',
            host,
            port: dbPort,
            username: user,
            password,
            database,
            entities: [
                __dirname + '/**/*.model.{js,ts}'
            ],
            synchronize: true,
            logging: true,
            charset: 'utf8mb4'
        });

        app.listen(port, () => {
            console.log('Database connected and server listening on port ' + port);
        });
    } catch (error) {
        console.error('Application startup failed:', error);
        process.exit(1);
    }
}

startApp();