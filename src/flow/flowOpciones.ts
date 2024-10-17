import { addKeyword, EVENTS } from '@builderbot/bot';
import { sendReaction, typing, delay } from '../utils/utils';
import { agregarTelefono } from '~/utils/telefonos';
import { consultaBalance } from './consultaBalance';
import { consultaProyecto } from './consultaProyecto';
import { reporteServicio } from './reporteServicio';
import { flowWelcome } from './flowWelcome';

const regexMenu: string = /^men[uú]$/i.toString();


export const flowOpciones = addKeyword(regexMenu, { regex: true })
    .addAction(async (ctx, { flowDynamic, provider, fallBack }) => {

        try {

            const Menu = /^men[uú]$/i;
            const id = ctx.from;
            console.log('activo menu1')

            if (Menu.test(ctx.body)) {
                const agregado = await agregarTelefono(id);
                await flowDynamic([
                    '*Constructora e Inmobiliaria Atlantico Reynoso*',
                    '',
                    '*_Seleccione una opcion:_*',
                    '',
                    '*1* - Consultar balance de pagos ',
                    '*2* - Proyectos Disponibles',
                    '*3* - Chatear con un representante',
                    '*4* - Cuentas de Pago',
                    '*5* - Cerrar sesion'
                ].join('\n'));
            }


        } catch (error) {
            console.error("Error en el flujo de Pregunta:", error);

        }

    })
    .addAction({ capture: true },
        async (ctx, { gotoFlow, provider, flowDynamic, fallBack }) => {

            const id = ctx.key.remoteJid;
            const clienteKey = parseInt(ctx.body);
            switch (ctx.body) {
                case '1':
                    return gotoFlow(consultaBalance);

                case '2':
                    return gotoFlow(consultaProyecto)

                case '3':
                    await typing(provider, ctx, 1000);
                    await flowDynamic(`Dele click al siguiente enlace para redirigirlo con uno uno de nuestros representantes: wa.me/18298415354`)
                    return fallBack();

                case '4':
                    await flowDynamic([
                        {
                          body: `Constructora e Inmobiliaria Atlantico Reynoso`,
                          media: 'https://images.prismic.io/atubot/ZrzIbkaF0TcGI7oc_pagosconstructora.jpeg'
                        }])
                        await flowDynamic([
                            '*Constructora e Inmobiliaria Atlantico Reynoso*',
                            '',
                            '*_Seleccione una opcion:_*',
                            '',
                            '*1* - Consultar balance de pagos ',
                            '*2* - Proyectos Disponibles',
                            '*3* - Chatear con un representante',
                            '*4* - Cuentas de Pago',
                            '*5* - Cerrar sesion'
                        ].join('\n'));
                    return fallBack();

                case '5':
                    await flowDynamic(`Gracias por escribirnos\n*Constructora e Inmobiliaria Atlantico Reynoso*`)
                    return fallBack();


                default:

                    return gotoFlow(flowWelcome);


            }
        }) 