import { createFlow } from '@builderbot/bot';
import { flowWelcome } from './flowWelcome';
import { flowOpciones } from './flowOpciones';
import { consultaBalance } from './consultaBalance';
import { reporteServicio } from './reporteServicio';

export const flow =  createFlow(
    [
        flowWelcome,
        flowOpciones,
        consultaBalance,
        reporteServicio
    ]);
