import React, { useState, useEffect } from 'react';
import styles from './Authetication.module.css';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext/AuthContext.tsx';
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { API_URL } from '../../config/api.ts';
import { converterBase64 } from '../../utils/CorverteImagem/corverteImagem.ts';

interface SituacaoProps {
    verificar: boolean;
}

interface dadosUsuario {
    nome: string;
    foto_pefil: string;
}

function Authentication({ verificar }: SituacaoProps) {
    const [condicaoUsuario, setCondicaoUsuario] = useState<boolean>(verificar);
    const [gmail, setGmail] = useState<string>('');
    const [nome, setNome] = useState<string>('');
    const [loginErro, setLoginErro] = useState<string>('');
    const [imgPerfil, setImgPerfil] = useState<string>('');
    const [dados, setDados] = useState<dadosUsuario | null>(null);

    const onSuccess = async (credentialResponse: any) => {
        try {
            const tokenGoogle = credentialResponse.credential;
            try {
                const decoded: { email?: string } = jwtDecode(tokenGoogle);
                if (decoded.email) setGmail(decoded.email);
            } catch (decodeErr) {
                console.error("Erro ao fazer login", decodeErr);
            }
        } catch (err) {
            console.error("Erro no login com o Google:", err);
        }
    };

    const onError = () => console.error("Erro no login com Google");

    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const buscarDados = async () => {
            try {
                const res = await axios.get(`${API_URL}/auth/gmail/${gmail}`);
                setDados(res.data);
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    if (condicaoUsuario) setLoginErro("Ops! Parece que você ainda não tem uma conta.");
                } else {
                    console.error("Erro ao buscar usuário", err);
                }
            }
        };
        if (gmail) buscarDados();
    }, [gmail]);

    useEffect(() => {
        if (condicaoUsuario && dados) {
            setNome(dados.nome);
            setImgPerfil(dados.foto_pefil);
        }
    }, [condicaoUsuario, dados]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginErro('');

        try {
            if (condicaoUsuario) {
                const res = await axios.post(`${API_URL}/auth/login`, { gmail });

                if (!res.data.token) {
                    setLoginErro("Erro: O servidor não enviou o token de acesso.");
                    return;
                }

                login({
                    id: res.data.id,
                    nome: res.data.nome,
                    gmail: res.data.gmail,
                    foto_perfil: res.data.foto_perfil,
                    descricao: res.data.descricao,
                    token: res.data.token
                });

                navigate('/explorar', { replace: true });
            } else {
                const res = await axios.post(`${API_URL}/auth/register`, { gmail, nome, imgPerfil });

                if (!res.data.token) {
                    setLoginErro("Erro ao gerar token no cadastro.");
                    return;
                }

                const usuarioData = res.data.usuario || res.data;

                login({
                    id: usuarioData.id,
                    nome: usuarioData.nome,
                    gmail: usuarioData.gmail,
                    foto_perfil: usuarioData.foto_perfil || imgPerfil,
                    token: res.data.token
                });

                navigate('/explorar', { replace: true });
            }
        } catch (err: any) {
            console.error("Erro detalhado:", err.response?.data || err.message);
            setLoginErro(err.response?.data?.error || "Erro na autenticação.");
        }
    };

    return (
        <main className={styles.authentication}>

            {/* ── Tela inicial: escolha do Google ── */}
            {!gmail && (
                <div className={styles.authCard}>

                    <div className={styles.authBrand}>
                        <div className={styles.authBrandLogo}>
                            <img src="/image/Eikon.ai.svg" alt="logo" />
                        </div>
                        <span className={styles.authBrandName}>Eikon.ai</span>
                    </div>

                    <div className={styles.authHeadline}>
                        <h1 className='text-center'>Bem-vindo de volta</h1>
                        <p className='text-center'>Entre com sua conta Google para continuar criando personagens.</p>
                    </div>

                    <div className={styles.authDivider} />

                    <div className={styles.googleBtnWrap}>
                        <GoogleLogin
                            onSuccess={onSuccess}
                            onError={onError}
                            auto_select={true}
                        />
                    </div>

                    <div className={styles.authFooter}>
                        <p className={styles.authPrivacy}>
                            Ao entrar, você concorda com nossos{' '}
                            <Link to="/termos">termos</Link> e{' '}
                            <Link to="/privacidade">política de privacidade</Link>.
                        </p>
                        <div className={styles.authDividerRow}>
                            <span className={styles.authDividerLine} />
                            <span className={styles.authDividerText}>ou</span>
                            <span className={styles.authDividerLine} />
                        </div>
                        <p className={styles.authSwitch}>
                            {condicaoUsuario
                                ? <>Não tem conta? <Link to="/cadastra">Cadastrar</Link></>
                                : <>Já tem conta? <Link to="/entrar">Entrar</Link></>
                            }
                        </p>
                    </div>

                </div>
            )}

            {/* ── Tela após autenticação Google ── */}
            {gmail && (
                <div className={styles.authCard}>

                    <div className={styles.authHeadline}>
                        <h1 className='text-center'>{condicaoUsuario ? 'Confirmar entrada' : 'Criar conta'}</h1>
                        <p className='text-center'>Confirme seus dados para {condicaoUsuario ? 'entrar' : 'criar sua conta'}.</p>
                    </div>

                    {/* Avatar */}
                    <div className={styles.avatarWrap}>
                        <div className={styles.avatarRel}>
                            <img
                                src={imgPerfil || '/image/semPerfil.jpg'}
                                alt="Foto de perfil"
                                className={styles.avatarImg}
                            />
                            <div className={styles.avatarEdit}>
                                <label htmlFor="foto" title="Alterar foto" style={{ cursor: 'pointer', margin: 0 }}>
                                    <i className="fa-solid fa-pen" style={{ fontSize: '11px' }}></i>
                                </label>
                                <input
                                    id="foto"
                                    type="file"
                                    accept="image/*"
                                    disabled={condicaoUsuario}
                                    onChange={(e) => converterBase64(e, setImgPerfil)}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Erro */}
                    {loginErro && (
                        <div className={styles.errorMsg}>
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>{loginErro}</span>
                        </div>
                    )}

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className={styles.authForm}>

                        <div className={styles.formField}>
                            <label htmlFor="nome">Nome</label>
                            <input
                                id="nome"
                                type="text"
                                required
                                disabled={condicaoUsuario}
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Seu nome"
                            />
                        </div>

                        <div className={styles.formField}>
                            <label htmlFor="gmail">Gmail</label>
                            <input
                                id="gmail"
                                type="email"
                                required
                                disabled
                                value={gmail}
                                placeholder="seu@gmail.com"
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                            {condicaoUsuario ? 'Entrar' : 'Cadastrar'}
                        </button>

                    </form>

                    <div className={styles.authDivider} />

                    <p className={styles.authSwitch}>
                        {condicaoUsuario
                            ? <>Não tem conta? <strong><Link to="/cadastra">Cadastrar</Link></strong></>
                            : <>Já tem conta? <strong><Link to="/entrar">Entrar</Link></strong></>
                        }
                    </p>
                </div>
            )}
        </main>
    );
}

export default Authentication;