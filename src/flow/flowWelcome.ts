import { addKeyword, EVENTS } from '@builderbot/bot';
import { sendReaction, typing, delay } from '../utils/utils';
import { agregarTelefono } from '~/utils/telefonos';
import { join } from 'path'
import GoogleSheetService from "../services/googleSheets";

const googleSheet = new GoogleSheetService(
    "18mos0WuhnqmoWw6wGHcrZbEVhkfDkB6vjfwHqs4xfOE"
);

export const flowWelcome = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { flowDynamic, provider, gotoFlow }) => {

        const id = ctx.from;

        try {

            const regex = /^\*Solicitud de envío\*\s*\n^\*Response\* #(\d+)\s*\n^\*Datos de envío :\* (.+)\s*\n^\*Paqueteria :\* (.+)\s*\n^\*Tipo :\* (.+)\s*\n^\*Peso :\* (\d+)\s*kg$/gm;

            const mensaje = ctx.body;
            const match = regex.exec(mensaje);

            if (match) {
                const response = String(match[1]);
                const datosEnvio = String(match[2]);
                const paqueteria = String(match[3]);
                const tipo = String(match[4]);
                const pesoNumeroInt = match[5];
                const peso = parseInt(pesoNumeroInt, 10);

                await flowDynamic('Consultando saldo 🏸')
                const data = await googleSheet.searchAndReturnRowByPhoneNumber(ctx.from);

                if (data !== null) {
                    const paquete = await googleSheet.buscarPreciosporKg(paqueteria);

                    const obtenerPrecio = (peso: number, tipo: string): string | null => {
                        const resultado = paquete.find(p => Number(p.kg) === peso);

                        if (resultado) {
                            return tipo.toLowerCase() === 'terrestre' ? resultado.terrestre : resultado.express;
                        }
                        return null;
                    };

                    const precio = obtenerPrecio(peso, tipo);

                    const precioEnvio = Number(precio); 

                    const saldoDisponible = Number(data.disponible); 

                    if (precioEnvio <= saldoDisponible) {
                        console.log(`El precio de ${precioEnvio} cubre el saldo disponible de ${saldoDisponible}. Continuar con la transacción.`);
                        const proveedores = await googleSheet.buscarProveedores(paqueteria);

                        const now = new Date();
                        const fecha = now.toISOString().split('T')[0];
                        const hora = now.toTimeString().split(' ')[0].substring(0, 5);

                        const orderData = {
                            id: response,                  
                            telefono: ctx.from,         
                            datos: datosEnvio,      
                            paqueteria: paqueteria,        
                            tipo: tipo,                 
                            peso: peso,                   
                            precio: precioEnvio,           
                            fecha: fecha,             
                            hora: hora,                    
                            proveedor: proveedores.nombre      
                        };
                        await provider.sendText(`${proveedores.telefono}@s.whatsapp.net`, `${ctx.body}`);
                        const subir = await googleSheet.saveOrder(orderData);
                        await flowDynamic('Tus pedido esta procesandose en unos minutos te enviaremos la guia 🤖')
                    } else {

                        await flowDynamic(`🚫 Lo sentimos, el precio del envío es *${precioEnvio}* y tu saldo disponible es *${saldoDisponible}.* No puedes continuar.`);
                    }


                } else {
                    await flowDynamic('⚠️ Ups parece que no estas registrado en la base de datos, en unos momentos un asesor se comunicara contigo para asistirte 🤖');
                }

            } else {
                console.log("El mensaje NO coincide con la estructura.");
            }

        } catch (error) {
            console.error("Error en el flujo de bienvenida:", error);

        }
    });
