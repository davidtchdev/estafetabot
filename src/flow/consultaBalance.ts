import { addKeyword, EVENTS } from '@builderbot/bot';
import { sendReaction, typing, delay } from '../utils/utils';
import GoogleSheetService from "../services/googleSheets";
import { flowOpciones } from './flowOpciones';

const googleSheet = new GoogleSheetService(
    "1oqS4KSe8pJL_KqW2NIstNbMcb15dQLxDB22uI_RnJHc"
);

export const consultaBalance = addKeyword(EVENTS.ACTION)
    .addAnswer("Ingrese su Cédula\n> ejemplo: 12345678901")
    .addAction({ capture: true }, async (ctx, { flowDynamic, provider, gotoFlow }) => {

        const message = String(ctx.body);

        try {

            const data = await googleSheet.searchAndReturnRowByPhoneNumber(message);

            if (data !== null) {

                await flowDynamic(
                    [
                        `Estimado cliente *${data.nombre}*`,
                        '',
                        `Su balance al dia: ${data.balance} Pesos.`,
                        `Monto atraso: *${data.atraso}* Pesos.`,
                        `Fecha ultimo Pago: *${data.fechaPago}*`,
                        '',
                        '*_Seleccione una opcion:_*',
                        '',
                        '*1* - Consultar balance de pagos ',
                        '*2* - Proyectos Disponibles',
                        '*3* - Chatear con un representante',
                        '*4* - Cuentas de Pago',
                        '*5* - Cerrar sesion'


                    ].join('\n'))
                    return gotoFlow(flowOpciones, 1);


            } else {

                await flowDynamic(
                    [
                        `La *cédula* digitada no es válida, la sesión ha sido cerrada.`,
                        '',
                        '*_Seleccione una opcion:_*',
                        '',
                        '*1* - Consultar balance de pagos ',
                        '*2* - Proyectos Disponibles',
                        '*3* - Chatear con un representante',
                        '*4* - Cuentas de Pago',
                        '*5* - Cerrar sesion'
                    ].join('\n'))
                    return gotoFlow(flowOpciones, 1);

            }




        } catch (error) {
            console.error("Error en el flujo de bienvenida:", error);

        }
    });
