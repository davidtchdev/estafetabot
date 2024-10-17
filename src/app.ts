import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createBot } from '@builderbot/bot';
import { JsonFileDB as Database } from '@builderbot/database-json';
import { provider } from "./provider";
import deleteFilesInFolderExcept from './config/clean';
import { flow } from "./flow";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Obtén la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT ?? 3008;

// Ruta al archivo JSON que quieres vaciar
const jsonFilePath = join(__dirname, '..', 'telefonos.json');



const main = async () => {
    // Configuración del bot y servidor
    const { handleCtx, httpServer } = await createBot({
        flow,
        provider,
        database: new Database({ filename: 'db.json' })
    }, {
        queue: {
            timeout: 20000,
            concurrencyLimit: 60
        }
    });


    // Iniciar el servidor
    httpServer(+PORT);
}

main();

