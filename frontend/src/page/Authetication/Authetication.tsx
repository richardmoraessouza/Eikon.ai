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
    const [dados, setDados] = useState<dadosUsuario | null>(null)

    const onSuccess = async (credentialResponse: any) => {
        try {
            const tokenGoogle = credentialResponse.credential;
        
            try {
                const decoded: { email?: string } = jwtDecode(tokenGoogle);
                if (decoded.email) {
                    setGmail(decoded.email);
                }

        

            } catch (decodeErr) {
                console.error("Erro ao fazer login", decodeErr);
            }

        } catch (err) {
            console.error("Erro no login com o Google:", err);
        }
    }

    const onError = () => {
        console.error("Erro no login com Google");
    };

    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const buscarDados = async () => {
            try {
                const res = await axios.get(`${API_URL}/auth/gmail/${gmail}`);
                const dados = res.data
                setDados(dados)
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    if (condicaoUsuario) {
                        setLoginErro("Ops! Parece que você ainda não tem uma conta.");
                    }
                } else {
                    console.error("Erro ao buscar usuário", err);
                }
            }
        }
    
        if (gmail) {
            buscarDados();
        }
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
                // --- LOGICA DE LOGIN ---
                const res = await axios.post(`${API_URL}/auth/login`, { gmail });
                
                if (!res.data.token) {
                    setLoginErro("Erro: O servidor não enviou o token de acesso.");
                    return;
                }

                // Aqui chamamos a função login do useAuth()
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
                // --- LOGICA DE CADASTRO ---
                const res = await axios.post(`${API_URL}/auth/register`, {
                    gmail,
                    nome,
                    imgPerfil
                });

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
            const mensagemErro = err.response?.data?.error || "Erro na autenticação.";
            setLoginErro(mensagemErro);
        }
    };
    return (
        <main className={`flex flex-col justify-center items-center ${styles.authentication}`}>
            {!gmail && (
            <div className={styles.modalBemVindoAlt}>
                <div className={styles.topRow}>
                    <div className={styles.logoWrap}>
                        <img src="/image/PersonIA.png" alt="logo" />
                    </div>
                    <div className={styles.titleGroup}>
                        <h2 className={styles.title}>Bem-vindo ao <span>PersonIA</span></h2>
                        <p className={styles.subtitle}>Crie ou entre na sua conta usando seu Gmail — rápido e seguro.</p>
                    </div>
                </div>

                <div className={styles.googleButtonWrapper}>
                    <GoogleLogin
                        onSuccess={onSuccess}
                        onError={onError}
                        auto_select={true}
                    />
                </div>

                <small className={styles.privacy}>Ao entrar, você concorda com nossos termos e política de privacidade.</small>
            </div>
            )}

            {gmail && (
                <section className={`${styles.verificarUsuario}`}>
                <h1 className={`text-center font-bold`}>{condicaoUsuario ? 'Entrar' : "Cadastra"}</h1>

                <form action="" method="post" className={`flex flex-col`} onSubmit={handleSubmit}>

                    <div className={`flex flex-col justify-center items-center ${styles.containerFoto}`}>
                        <div className="relative">
                            <img src={imgPerfil || '/image/semPerfil.jpg'} alt="Foto Perfil" className="w-28 h-28 rounded-full object-cover"/>
                            <div className="absolute bottom-0 right-1 bg-gray-900 w-9 h-9 text-xl rounded-full flex justify-center items-center">
                                <label htmlFor="foto" title="Alterar foto">
                                    <i className="fa-solid fa-pen cursor-pointer"></i>
                                </label>
                                <input id="foto" type="file" accept="image/*"disabled={condicaoUsuario} onChange={(e) => converterBase64(e, setImgPerfil)} className="hidden"/>
                            </div>
                        </div>
                    </div>
                    <div>{loginErro && <p className={`text-center text-red-500`}>{loginErro}</p>}</div>

                    <label htmlFor="nome">Nome</label>
                    <input 
                        type="text" 
                        name="nome" 
                        id="" 
                        required
                        disabled={condicaoUsuario}
                        value={nome} 
                        onChange={(e) => setNome(e.target.value)} 
                    />
                
                    <label htmlFor="gmail">Gmail</label>
                    <input 
                        type="email" 
                        name="gmail" 
                        id="" 
                        required
                        placeholder='Digite seu Gmail' 
                        value={gmail} 
                        disabled
                        onChange={(e) => setGmail(e.target.value)} 
                    />
                   
                    <input type="submit" value={condicaoUsuario ? "Entrar" : "Cadastra"} />
                </form>
                
                {/* Links de navegação */}
                {
                    condicaoUsuario ? 
                    (<p className='text-center'>Não possui conta? <strong><Link to={"/cadastra"}>Cadastra</Link></strong></p>) : 
                    (<p className='text-center'>Já possui conta? <strong><Link to={"/entrar"}>Entrar</Link></strong></p>)
                }
            </section>
            )}
        </main>
    )
}

export default Authentication;