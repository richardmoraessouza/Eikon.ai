import { useEffect, useState } from 'react';
import styles from './TapsProfileEdit.module.css';
import { FiCamera, FiUser, FiFileText, FiCheck, FiAlertCircle } from "react-icons/fi";
import { useUsers } from '../../../../hooks/useUsers/useUsers';
import { useAuth } from '../../../../hooks/AuthContext/AuthContext';
import { normalizeFrame } from '../../../../utils/frame';

const TapsProfileEdit: React.FC = () => {
    const { 
        usuarioId, 
        token, 
        fotoPerfil: ctxFotoPerfil,
        descricao: ctxDescricao,
        usuario: ctxNome,
        updateProfile,
        frame
    } = useAuth();
        
    const { users, loading, error, updateUser } = useUsers(usuarioId);

    const [imgPerfil, setImgPerfil] = useState<string>('');
    const [novoNome, setNovoNome] = useState<string>('');
    const [descricao, setDescricao] = useState<string>('');
    const [sucesso, setSucesso] = useState<string | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [salvando, setSalvando] = useState(false);

    const frameAtivo = normalizeFrame(frame);
    const caminhoFrame = frameAtivo ? `/image/frames/${frameAtivo}` : null;

    useEffect(() => {
        const storedNome = localStorage.getItem('usuario_nome') || ctxNome;
        const storedFoto = localStorage.getItem('usuario_foto') || ctxFotoPerfil;
        const storedDescricao = localStorage.getItem('usuario_descricao') || ctxDescricao;

        setNovoNome(storedNome || '');
        setImgPerfil(storedFoto || '');
        setDescricao(storedDescricao || '');
    }, [ctxNome, ctxFotoPerfil, ctxDescricao]);

    useEffect(() => {
        if (users && users.length > 0) {
            const dadosUsuario = users[0];
            if (dadosUsuario.nome) setNovoNome(dadosUsuario.nome);
            if (dadosUsuario.descricao) setDescricao(dadosUsuario.descricao);
            if (dadosUsuario.foto_perfil) {
                setImgPerfil(dadosUsuario.foto_perfil);
            } else if (dadosUsuario.avatarUrl) {
                setImgPerfil(dadosUsuario.avatarUrl);
            }
        }
    }, [users]);

    const converterBase64 = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImgPerfil(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSucesso(null);
        setErro(null);

        if (!usuarioId || !token) {
            setErro("Você precisa estar logado para editar o perfil.");
            return;
        }

        if (!novoNome || novoNome.trim().length === 0) {
            setErro("O nome é obrigatório.");
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
            await updateUser(usuarioId, token, {
                nome: novoNome,
                foto_perfil: imgPerfil,
                descricao: descricao
            });

            localStorage.setItem('usuario_nome', novoNome);
            localStorage.setItem('usuario_foto', imgPerfil);
            localStorage.setItem('usuario_descricao', descricao);

            updateProfile({
                nome: novoNome,
                foto_perfil: imgPerfil,
                descricao: descricao
            });

            setSucesso("Perfil atualizado com sucesso!");
            setTimeout(() => setSucesso(null), 3000);
        } catch (err) {
            console.error("Erro ao atualizar dados do perfil:", err);
            setErro("Erro ao salvar alterações. Tente novamente.");
        } finally {
            setSalvando(false);
        }
    };

    // 1. Estado de Carregamento estruturado com Skeletons miméticos
    if (loading) return (
        <section className={styles.section} aria-busy="true">
            <div className={styles.container}>
                
                {/* Skeleton do Avatar */}
                <div className={styles.avatarSection}>
                    <div className={styles.avatarWrapOuter}>
                        <div className={`${styles.avatarWrapper} ${styles.skeletonCircle}`} />
                    </div>
                </div>

                {/* Skeleton do Campo de Nome */}
                <div className={styles.field}>
                    <div className={styles.skeletonLabel} />
                    <div className={styles.skeletonInput} />
                </div>

                {/* Skeleton do Campo de Descrição */}
                <div className={styles.field}>
                    <div className={styles.skeletonLabel} />
                    <div className={`${styles.skeletonInput} ${styles.skeletonTextarea}`} />
                </div>

                {/* Skeleton do Botão de Submit */}
                <div className={styles.skeletonButton} />
                
            </div>
        </section>
    );

    // 2. Renderização Principal do Formulário
    return (
        <section className={styles.section}>
            <form onSubmit={handleSubmit} className={styles.container}>

                {/* AVATAR */}
                <div className={styles.avatarSection}>
                    <div className={styles.avatarWrapOuter}>
                        <div className={styles.avatarWrapper}>
                            <img 
                                src={imgPerfil || '/image/semPerfil.jpg'} 
                                alt="Foto Perfil" 
                                className={styles.avatar}
                            />
                            <label htmlFor="foto" className={styles.avatarOverlay} title="Alterar foto">
                                <FiCamera size={18} />
                                <span>Alterar</span>
                            </label>
                            <input 
                                id="foto" 
                                type="file" 
                                accept="image/*" 
                                onChange={converterBase64} 
                                className={styles.hiddenInput}
                            />
                        </div>
                        {caminhoFrame && (
                            <img
                                src={caminhoFrame}
                                alt="Frame"
                                className={styles.frameImg}
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