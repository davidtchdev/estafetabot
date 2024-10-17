import { addKeyword, EVENTS } from '@builderbot/bot';
import GoogleSheetService from "../services/googleSheets";
import { unlinkSync } from 'fs';

const googleSheet = new GoogleSheetService(
    "18mos0WuhnqmoWw6wGHcrZbEVhkfDkB6vjfwHqs4xfOE"
);

export const reporteServicio = addKeyword(EVENTS.DOCUMENT)
    .addAction(async (ctx, { flowDynamic, provider, gotoFlow, state }) => {

        const filename = ctx.message.documentMessage.fileName;
        const id = filename.split('.').slice(0, -1).join('.');

        try {

            const data = await googleSheet.reenviarPdf(id);

            if (data !== null) {

                const localPath = await provider.saveFile(ctx, { path: '.' })

                await provider.sendFile(`${data.telefono}@s.whatsapp.net`, localPath, `Paqueteria: ${data.paqueteria}\nTipo: ${data.tipo}\nPrecio: ${data.precio}`)


                try {
                    unlinkSync(localPath);
                    console.log("Archivo eliminado exitosamente.");
                } catch (err) {
                    console.error("Error al eliminar el archivo:", err);
                }

            } else {

                await flowDynamic('no hay un pedido')

            }


        } catch (error) {
            console.error("Error en el flujo de bienvenida:", error);
        }
    });





