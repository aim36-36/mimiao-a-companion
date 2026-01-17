import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env';
import routes from './routes';

const app: Express = express();

// =====================================================
// 中间件
// =====================================================
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =====================================================
// 健康检查路由
// =====================================================
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV,
    });
});

// =====================================================
// API路由
// =====================================================
app.use('/api', routes);

// =====================================================
// 404处理
// =====================================================
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

// =====================================================
// 错误处理中间件
// =====================================================
app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: config.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// =====================================================
// 启动服务器
// =====================================================
const PORT = config.PORT;

// 如果不是运行在 Vercel Serverless 环境中，则启动监听
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`
    ╔═══════════════════════════════════════╗
    ║   米缪OS API Server is running       ║
    ║                                       ║
    ║   Port: ${PORT}                       ║
    ║   Environment: ${config.NODE_ENV.padEnd(20)} ║
    ║   Status: Ready ✓                    ║
    ╚═══════════════════════════════════════╝
    `);

        if (config.NODE_ENV === 'development') {
            console.log(`\n  API Documentation:`);
            console.log(`  → Health Check: http://localhost:${PORT}/health`);
            console.log(`  → API Base URL: http://localhost:${PORT}/api\n`);
        }
    });
}

export default app;
