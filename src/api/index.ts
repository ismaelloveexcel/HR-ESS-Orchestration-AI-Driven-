import { Router } from 'express';
import employeeRouter from './employees';
import authRouter from './auth';

export const apiRouter = Router();

// API routes
apiRouter.use('/auth', authRouter);
apiRouter.use('/employees', employeeRouter);

// API info endpoint
apiRouter.get('/', (req, res) => {
  res.json({
    message: 'HR ESS API',
    version: '0.1.0',
    endpoints: {
      auth: '/api/auth',
      employees: '/api/employees'
    }
  });
});

export default apiRouter;
