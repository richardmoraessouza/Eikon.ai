"use client";

import React, { useState, useEffect } from 'react';
import styles from './Authetication.module.css';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/AuthContext/AuthContext';
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { API_URL } from '@/config/api';
import { converterBase64 } from '@/utils/CorverteImagem/corverteImagem';

interface SituacaoProps {
    verificar: boolean;
}

interface dadosUsuario {
    nome: string;
    foto_pefil: string;
    frame: string;
    username: string;
}

// Só permite letras, números, ponto e underscore — sem espaço e sem caracteres especiais tipo [ ] @ #
const USERNAME_REGEX = /^[a-zA-Z0-9._]*$/;
const USERNAME_MIN = 3;
const USERNAME_MAX = 20;

function Authentication({ verificar }: SituacaoProps) {
    const [condicaoUsuario, setCondicaoUsuario] = useState<boolean>(verificar);
    const [gmail, setGmail] = useState<string>('');
    const [nome, setNome] = useState<string>('');
    const [loginErro, setLoginErro] = useState<string>('');
    const [imgPerfil, setImgPerfil] = useState<string>('');
    const [dados, setDados] = useState<dadosUsuario | null>(null);
    const [username, setUsername] = useState<string>('');
    const [usernameErro, setUsernameErro] = useState<string>('');

    const router = useRouter();
    const { login } = useAuth();

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
            setNome(dados.nome || dados.username || '');
            setImgPerfil(dados.foto_pefil);
            setUsername(dados.username || '');
        }
    }, [condicaoUsuario, dados]);

    // Valida o formato do username (usado tanto ao digitar quanto antes de enviar)
    const validarUsername = (value: string): string => {
        if (value.length === 0) return '';
        if (value.length < USERNAME_MIN) return `O username precisa ter pelo menos ${USERNAME_MIN} caracteres.`;
        if (value.length > USERNAME_MAX) return `O username pode ter no máximo ${USERNAME_MAX} caracteres.`;
        if (!USERNAME_REGEX.test(value)) return 'Use apenas letras, números, ponto (.) e underscore (_) — sem espaços.';
        return '';
    };

    const handleUsernameChange = (value: string) => {
        // Bloqueia espaço e qualquer caractere fora de [a-zA-Z0-9._] já ao digitar,
        // em vez de deixar digitar e só reclamar depois
        const valorFiltrado = value.replace(/[^a-zA-Z0-9._]/g, '');
        setUsername(valorFiltrado);
        setNome(valorFiltrado);
        setUsernameErro(validarUsername(valorFiltrado));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginErro('');

        // Na tela de cadastro, valida o username antes de mandar pro backend
        if (!condicaoUsuario) {
            const erroUsername = validarUsername(username);
            if (erroUsername) {
                setUsernameErro(erroUsername);
                return;
            }
        }

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
                    token: res.data.token,
                    frame: res.data.frame
                });

                router.replace('/');
            } else {
                // O backend deve comparar username de forma case-insensitive (LOWER(username))
                // para "lucas", "Lucas" e "LUCAS" contarem como o mesmo username já em uso
                const res = await axios.post(`${API_URL}/auth/register`, { gmail, nome: username, username, imgPerfil });

                if (!res.data.token) {
                    setLoginErro("Erro ao gerar token no cadastro.");
                    return;
                }

                const usuarioData = res.data.usuario || res.data;

                login({
                    id: usuarioData.id,
                    nome: usuarioData.nome || username,
                    gmail: usuarioData.gmail,
                    foto_perfil: usuarioData.foto_perfil || imgPerfil,
                    token: res.data.token,
                    frame: usuarioData.frame
                });

                router.replace('/');
            }
        } catch (err: any) {
            console.error("Erro detalhado:", err.response?.data || err.message);
            const mensagemErro = err.response?.data?.error || "Erro na autenticação.";
            setLoginErro(mensagemErro);
            if (mensagemErro.includes('username')) {
                setUsernameErro('Esse username já existe. Escolha outro.');
            }
        }
    };

    return (
        <main className={styles.authentication}>

            {!gmail && (
                <div className={styles.authCard}>
                    <div className={styles.authBrand}>
                        <div className={styles.authBrandLogo}>
                            <Image src="/image/logo-dark.png" alt="logo" width={40} height={40} className={`${styles.darkLogo}`}/>
                            <Image src="/image/logo-white.png" alt="logo" width={40} height={40} className={styles.lightLogo} />
                        </div>
                        <span className={styles.authBrandName}>Eikon.ai</span>
                    </div>

                    <div className={styles.authHeadline}>
                        <h1 className='text-center'>Bem-vindo de volta</h1>
                        <p className='text-center'>Entre com sua conta Google para continuar criando personagens.</p>
                    </div>

                    <div className={styles.authDivider} />

                    <div className={styles.googleBtnWrap}>
                        <GoogleLogin onSuccess={onSuccess} onError={onError} auto_select={true} />
                    </div>

                    <div className={styles.authFooter}>
                        <p className={styles.authPrivacy}>
                            Ao entrar, você concorda com nossos{' '}
                            <Link href="/terms">termos</Link> e{' '}
                            <Link href="/privacy">política de privacidade</Link>.
                        </p>
                        <div className={styles.authDividerRow}>
                            <span className={styles.authDividerLine} />
                            <span className={styles.authDividerText}>ou</span>
                            <span className={styles.authDividerLine} />
                        </div>
                        <p className={styles.authSwitch}>
                            {condicaoUsuario
                                ? <>Não tem conta? <Link href="/register">Cadastrar</Link></>
                                : <>Já tem conta? <Link href="/login">Entrar</Link></>
                            }
                        </p>
                    </div>
                </div>
            )}

            {gmail && (
                <div className={styles.authCard}>
                    <div className={styles.authHeadline}>
                        <h1 className='text-center'>{condicaoUsuario ? 'Confirmar entrada' : 'Criar conta'}</h1>
                        <p className='text-center'>Confirme seus dados para {condicaoUsuario ? 'entrar' : 'criar sua conta'}.</p>
                    </div>

                    <div className={styles.avatarWrap}>
                        <div className={styles.avatarRel}>
                            <Image src={imgPerfil || '/image/semPerfil.jpg'} alt="Foto de perfil" className={styles.avatarImg} width={100} height={100} />
                            {dados?.frame && (
                                <Image src={`/image/frames/${dados.frame}`} alt="Frame" className={styles.avatarFrame} width={100} height={100} />
                            )}
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

                    {loginErro && (
                        <div className={styles.errorMsg}>
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>{loginErro}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.authForm}>
                        <div className={styles.formField}>
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                required
                                disabled={condicaoUsuario}
                                value={username}
                                onChange={(e) => handleUsernameChange(e.target.value)}
                                placeholder="lucas.silva"
                                maxLength={USERNAME_MAX}
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                            />
                            {!condicaoUsuario && usernameErro && (
                                <span className={styles.fieldError}>{usernameErro}</span>
                            )}
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

                        <button type="submit" className={styles.submitBtn} disabled={!condicaoUsuario && !!usernameErro}>
                            {condicaoUsuario ? 'Entrar' : 'Cadastrar'}
                        </button>
                    </form>

                    <div className={styles.authDivider} />

                    <p className={styles.authSwitch}>
                        {condicaoUsuario
                            ? <>Não tem conta? <strong><Link href="/register">Cadastrar</Link></strong></>
                            : <>Já tem conta? <strong><Link href="/login">Entrar</Link></strong></>
                        }
                    </p>
                </div>
            )}
        </main>
    );
}

export default Authentication;