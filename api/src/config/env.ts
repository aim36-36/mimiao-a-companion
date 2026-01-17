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

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Vercel build fails with BinaryExpression (||) in configuration objects.
// We must use only Identifiers here.
export const config: EnvConfig = {
    PORT,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_KEY,
    DEEPSEEK_API_KEY,
    NODE_ENV,
};

// Runtime validation
if (!config.SUPABASE_URL) console.warn('Missing SUPABASE_URL');
if (!config.SUPABASE_ANON_KEY) console.warn('Missing SUPABASE_ANON_KEY');
if (!config.SUPABASE_SERVICE_KEY) console.warn('Missing SUPABASE_SERVICE_KEY');

export default config;
