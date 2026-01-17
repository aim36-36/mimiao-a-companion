import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    PORT: number;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_KEY: string;
    DEEPSEEK_API_KEY?: string;
    NODE_ENV: string;
}

function getEnvVar(key: string, required: boolean = true): string {
    const value = process.env[key];
    if (required && !value) {
        console.error(`ERROR: Missing required environment variable: ${key}`);
        // 返回空字符串以允许应用启动，但在运行时可能会失败
        return '';
    }
    return value || '';
}

const portEnv = getEnvVar('PORT', false);
const PORT = portEnv ? parseInt(portEnv, 10) : 3001;

export const config: EnvConfig = {
    PORT,
    SUPABASE_URL: getEnvVar('SUPABASE_URL'),
    SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_KEY: getEnvVar('SUPABASE_SERVICE_KEY'),
    DEEPSEEK_API_KEY: getEnvVar('DEEPSEEK_API_KEY', false),
    NODE_ENV: getEnvVar('NODE_ENV', false) || 'development',
};

export default config;
