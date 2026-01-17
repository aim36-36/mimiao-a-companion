import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
    onClose?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const { signUp, signIn, error } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        setLoading(true);

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password, username || undefined);
            }
            onClose?.();
        } catch (err: any) {
            setLocalError(err.message || '操作失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setLocalError(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-paper border-2 border-ink rounded-sketch-1 shadow-sketch-lg p-8 transform animate-[slide-up_0.3s_ease-out]">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h2 className="text-3xl font-display font-black text-ink mb-2 tracking-tight">
                        {isLogin ? '欢迎回来' : '创建账号'}
                    </h2>
                    <p className="text-sm text-ink/60 font-medium">
                        {isLogin ? '登录以继续与米缪对话' : '注册以开始你的旅程'}
                    </p>
                </div>

                {/* Error Message */}
                {(error || localError) && (
                    <div className="mb-4 p-3 bg-red-50 border-2 border-red-600 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">{error || localError}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username (only for register) */}
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-bold text-ink mb-2">
                                用户名 <span className="text-ink/40">(可选)</span>
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="指挥官"
                                className="w-full px-4 py-3 border-2 border-ink/20 rounded-lg focus:outline-none focus:border-primary bg-white/50 backdrop-blur-sm transition-all"
                            />
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-bold text-ink mb-2">
                            邮箱地址 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 border-2 border-ink/20 rounded-lg focus:outline-none focus:border-primary bg-white/50 backdrop-blur-sm transition-all"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-bold text-ink mb-2">
                            密码 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="至少6位字符"
                            className="w-full px-4 py-3 border-2 border-ink/20 rounded-lg focus:outline-none focus:border-primary bg-white/50 backdrop-blur-sm transition-all"
                        />
                        {!isLogin && (
                            <p className="mt-1 text-xs text-ink/50">密码至少需要6个字符</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-ink text-paper font-bold rounded-lg hover:bg-ink/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                    >
                        {loading ? '处理中...' : isLogin ? '登录' : '注册'}
                    </button>
                </form>

                {/* Toggle Mode */}
                <div className="mt-6 text-center">
                    <button
                        onClick={toggleMode}
                        className="text-sm text-ink/60 hover:text-ink font-medium transition-colors"
                    >
                        {isLogin ? (
                            <>
                                还没有账号？<span className="text-primary font-bold ml-1">立即注册</span>
                            </>
                        ) : (
                            <>
                                已有账号？<span className="text-primary font-bold ml-1">立即登录</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Footer Note */}
                <div className="mt-6 pt-4 border-t border-ink/10">
                    <p className="text-xs text-center text-ink/40 leading-relaxed">
                        继续即表示您同意我们的服务条款和隐私政策
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
