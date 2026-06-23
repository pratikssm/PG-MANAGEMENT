import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimit';
import { notFound, errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(hpp());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan(env.isProd ? 'combined' : 'dev'));

app.use('/api', apiLimiter);
app.use('/api', routes);

app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'StayNest Premium PG Management API',
    version: '1.0.0',
    docs: '/api/health',
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
