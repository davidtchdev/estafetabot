import { addKeyword, EVENTS } from '@builderbot/bot';
import GoogleSheetService from "../services/googleSheets";
import { unlinkSync } from 'fs';

const googleSheet = new GoogleSheetService(
    "18mos0WuhnqmoWw6wGHcrZbEVhkfDkB6vjfwHqs4xfOE"
);

export const reporteServicio = addKeyword(EVENTS.DOCUMENT)
    .addAction(async (ctx, { flowDynamic, provider, gotoFlow, state }) => {


        try {
            const filename = ctx.message.documentMessage.fileName;
            const id = filename.split('.').slice(0, -1).join('.');

            const extract13Digits = (input: string): string | null => {
                // Usar expresión regular para encontrar una secuencia de 13 dígitos
                const match = input.match(/\d{13}/); // Busca exactamente 13 dígitos consecutivos
            
                // Si se encontró un match, devolverlo
                return match ? match[0] : null;
            };
            
            // Ejemplo de uso

            const extractedDigits = extract13Digits(id);       
            
            const data = await googleSheet.reenviarPdf(extractedDigits);
            console.log(extractedDigits)


            if (data !== null) {

                const localPath = await provider.saveFile(ctx, { path: '.' })

                await provider.sendFile(`${data.telefono}@s.whatsapp.net`, localPath, `*Paqueteria:* ${data.paqueteria}\n*Tipo:* ${data.tipo}\n*Precio:* ${data.precio}\n*Folio:* ${data.folio}`)


                try {
                    unlinkSync(localPath);
                    console.log("Archivo eliminado exitosamente.");
                } catch (err) {
                    console.error("Error al eliminar el archivo:", err);
                }

            } else {

                console.log('no hay pedido para este PDF')

            }


        } catch (error) {
            console.error("Error en el flujo de bienvenida:", error);
        }
    });





