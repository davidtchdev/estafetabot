import { createFlow } from '@builderbot/bot';
import { flowWelcome } from './flowWelcome';
import { reporteServicio } from './reporteServicio';

export const flow =  createFlow(
    [
        flowWelcome,
        reporteServicio
    ]);
