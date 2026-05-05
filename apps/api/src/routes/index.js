import { Router } from 'express';
import healthCheck from './health-check.js';
import kbzPayRouter from './kbz-pay.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.use('/kbz-pay', kbzPayRouter);

    return router;
};