'use client'; // Necessário no Next.js (App Router) para componentes com hooks e estados

import { useEffect, useState } from 'react';
import Image from 'next/image'; // Importação do componente de imagem otimizado do Next.js
import styles from './TapsProfileEdit.module.css';
import { FiCamera, FiUser, FiFileText, FiCheck, FiAlertCircle } from "react-icons/fi";
import { useUsers } from '../../../../../hooks/useUsers/useUsers';
import { useAuth } from '../../../../../contexts/AuthContext/AuthContext';
import { getFrameImagePath } from '../../../../../utils/frame';
import { uploadMidia } from '../../../../../services/supabaseUpload';
import { getCurrentAuthToken } from '../../../../../config/authTokenStore';

const USERNAME_REGEX = /^[a-zA-Z0-9._]*$/;
const USERNAME_MIN = 3;
const USERNAME_MAX = 20;

const TapsProfileEdit: React.FC = () => {
    const { 
        usuarioId, 
        token, 
        fotoPerfil: ctxFotoPerfil,
        descricao: ctxDescricao,
        usuario: ctxNome,
        updateProfile,
        frame,
        loading: authLoading,
    } = useAuth();
        
    const { users, loading, error, updateUser } = useUsers(usuarioId);

    const [imgPerfil, setImgPerfil] = useState<string>('');
    const [novoNome, setNovoNome] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [usernameErro, setUsernameErro] = useState<string>('');
    const [descricao, setDescricao] = useState<string>('');
    const [sucesso, setSucesso] = useState<string | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [salvando, setSalvando] = useState(false);
    const [subindoFoto, setSubindoFoto] = useState(false);
    const [fotoSelecionada, setFotoSelecionada] = useState<File | null>(null);
    const [previewFoto, setPreviewFoto] = useState<string | null>(null);
    const [pathFotoAtual, setPathFotoAtual] = useState<string | null>(null);

    const caminhoFrame = getFrameImagePath(frame);
    const imagemExibida = previewFoto || imgPerfil || '/image/semPerfil.jpg';

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setNovoNome(ctxNome || '');
            setImgPerfil(ctxFotoPerfil || '');
            setDescricao(ctxDescricao || '');
            setUsername('');
        }
    }, [ctxNome, ctxFotoPerfil, ctxDescricao]);

    useEffect(() => {
        if (users && users.length > 0) {
            const dadosUsuario = users[0];
            if (dadosUsuario.nome) setNovoNome(dadosUsuario.nome);
            if (dadosUsuario.username) setUsername(dadosUsuario.username);
            if (dadosUsuario.descricao) setDescricao(dadosUsuario.descricao);
            if (dadosUsuario.foto_perfil) {
                setImgPerfil(dadosUsuario.foto_perfil);
            } else if (dadosUsuario.avatarUrl) {
                setImgPerfil(dadosUsuario.avatarUrl);
            }
        }
    }, [users]);

    useEffect(() => {
        return () => {
            if (previewFoto?.startsWith('blob:')) {
                URL.revokeObjectURL(previewFoto);
            }
        };
    }, [previewFoto]);

    const validarUsername = (value: string): string => {
        if (value.length === 0) return '';
        if (value.length < USERNAME_MIN) return `O username precisa ter pelo menos ${USERNAME_MIN} caracteres.`;
        if (value.length > USERNAME_MAX) return `O username pode ter no máximo ${USERNAME_MAX} caracteres.`;
        if (!USERNAME_REGEX.test(value)) return 'Use apenas letras, números, ponto (.) e underscore (_) — sem espaços.';
        return '';
    };

    const handleUsernameChange = (value: string) => {
        const valorFiltrado = value.replace(/[^a-zA-Z0-9._]/g, '');
        setUsername(valorFiltrado);
        setUsernameErro(validarUsername(valorFiltrado));
    };

    const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setErro('Selecione um arquivo de imagem válido.');
            e.target.value = '';
            return;
        }

        if (previewFoto?.startsWith('blob:')) {
            URL.revokeObjectURL(previewFoto);
        }

        const objectUrl = URL.createObjectURL(file);
        setFotoSelecionada(file);
        setPreviewFoto(objectUrl);
        setErro(null);
        setSucesso('Foto escolhida. Clique em salvar para enviar e persistir.');
        e.target.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSucesso(null);
        setErro(null);

        const authToken = token ?? getCurrentAuthToken();

        if (!usuarioId) {
            setErro("Você precisa estar logado para editar o perfil.");
            return;
        }

        if (!novoNome || novoNome.trim().length === 0) {
            setErro("O nome é obrigatório.");
            return;
        }

        const erroUsername = validarUsername(username);
        if (erroUsername) {
            setUsernameErro(erroUsername);
            setErro(erroUsername);
            return;
        }

        if (/[^A-Za-zÀ-ú0-9 ]/.test(novoNome)) {
            setErro("O nome contém caracteres inválidos.");
            return;
        }

        if (!/[A-Za-zÀ-ú]/.test(novoNome)) {
            setErro("O nome deve conter letras.");
            return;
        }

        try {
            setSalvando(true);
            let fotoParaPersistir = imgPerfil;

            if (fotoSelecionada) {
                setSubindoFoto(true);
                const { publicUrl, path } = await uploadMidia(fotoSelecionada, 'usuario', pathFotoAtual);
                fotoParaPersistir = publicUrl;
                setImgPerfil(publicUrl);
                setPathFotoAtual(path || null);
            }

            await updateUser(usuarioId, authToken ?? undefined, {
                nome: novoNome,
                username,
                foto_perfil: fotoParaPersistir,
                descricao: descricao
            });

            updateProfile({
                nome: novoNome,
                username,
                foto_perfil: fotoParaPersistir,
                descricao: descricao
            });

            if (previewFoto?.startsWith('blob:')) {
                URL.revokeObjectURL(previewFoto);
            }
            setFotoSelecionada(null);
            setPreviewFoto(null);
            setSucesso("Perfil atualizado com sucesso!");
            setTimeout(() => setSucesso(null), 3000);
        } catch (err: any) {
            console.error("Erro ao atualizar dados do perfil:", err);
            const mensagemErro = err?.response?.data?.error || err?.message || "Erro ao salvar alterações. Tente novamente.";
            if (mensagemErro.includes('username')) {
                setUsernameErro('Esse username já existe. Escolha outro.');
                setErro('Esse username já existe. Escolha outro.');
            } else {
                setErro(mensagemErro);
            }
        } finally {
            setSalvando(false);
            setSubindoFoto(false);
        }
    };

    if (authLoading || loading) return (
        <section className={styles.section} aria-busy="true">
            <div className={styles.container}>
                <div className={styles.avatarSection}>
                    <div className={styles.avatarWrapOuter}>
                        <div className={`${styles.avatarWrapper} ${styles.skeletonCircle}`} />
                    </div>
                </div>
                <div className={styles.field}>
                    <div className={styles.skeletonLabel} />
                    <div className={styles.skeletonInput} />
                </div>
                <div className={styles.field}>
                    <div className={styles.skeletonLabel} />
                    <div className={`${styles.skeletonInput} ${styles.skeletonTextarea}`} />
                </div>
                <div className={styles.skeletonButton} />
            </div>
        </section>
    );

    return (
        <section className={styles.section}>
            <form onSubmit={handleSubmit} className={styles.container}>

                {/* AVATAR */}
                <div className={styles.avatarSection}>
                    <div className={styles.avatarWrapOuter}>
                        <div className={styles.avatarWrapper}>
                            <Image 
                                src={imagemExibida} 
                                alt="Foto Perfil" 
                                className={styles.avatar}
                                width={120}
                                height={120} 
                                priority
                            />
                            <label htmlFor="foto" className={styles.avatarOverlay} title="Alterar foto">
                                <FiCamera size={18} />
                                <span>Alterar</span>
                            </label>
                            <input 
                                id="foto" 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFotoUpload} 
                                className={styles.hiddenInput}
                                disabled={subindoFoto}
                            />
                        </div>
                        {caminhoFrame && (
                            <Image
                                src={caminhoFrame}
                                alt="Frame"
                                className={styles.frameImg}
                                width={130}
                                height={130}
                            />
                        )}
                    </div>
                </div>

                {/* FEEDBACKS */}
                {(error || erro) && (
                    <div className={styles.feedbackError}>
                        <FiAlertCircle size={14} />
                        <span>{error || erro}</span>
                    </div>
                )}
                {sucesso && (
                    <div className={styles.feedbackSuccess}>
                        <FiCheck size={14} />
                        <span>{sucesso}</span>
                    </div>
                )}

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="username">
                        <FiUser size={13} />
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        className={styles.input}
                        placeholder="username"
                        maxLength={USERNAME_MAX}
                        value={username}
                        onChange={e => handleUsernameChange(e.target.value)}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                    <span className={styles.counter}>{username.length}/20</span>
                </div>

                {/* NOME */}
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="nome">
                        <FiUser size={13} />
                        Nome
                    </label>
                    <input 
                        type="text" 
                        id="nome"
                        className={styles.input}
                        placeholder="Nome" 
                        maxLength={20} 
                        minLength={2} 
                        value={novoNome}
                        required
                        onChange={e => setNovoNome(e.target.value.replace(/[^A-Za-zÀ-ú0-9 ]/g, ''))}
                    />
                    <span className={styles.counter}>{novoNome.length}/20</span>
                </div>


                {/* DESCRIÇÃO */}
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="descricao">
                        <FiFileText size={13} />
                        Descrição
                    </label>
                    <textarea 
                        id="descricao"
                        className={styles.textarea}
                        placeholder="Descrição"
                        maxLength={150}
                        value={descricao}
                        onChange={e => setDescricao(e.target.value)}
                    />
                    <span className={styles.counter}>{descricao.length}/150</span>
                </div>

                {/* SUBMIT */}
                <button 
                    type="submit" 
                    className={styles.button}
                    disabled={salvando}
                >
                    {salvando ? (
                        <>
                            <div className={styles.btnSpinner} />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <FiCheck size={14} />
                            Salvar alterações
                        </>
                    )}
                </button>
            </form>
        </section>
    );
};

export default TapsProfileEdit;