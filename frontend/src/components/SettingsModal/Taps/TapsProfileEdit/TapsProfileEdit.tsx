import { useEffect, useState } from 'react';
import styles from './TapsProfileEdit.module.css';
import { FiEdit2 } from "react-icons/fi";
import { useUsers } from '../../../../hooks/useUsers/useUsers';
import { useAuth } from '../../../../hooks/AuthContext/AuthContext';

const TapsProfileEdit: React.FC = () => {
    const { 
        usuarioId, 
        token, 
        fotoPerfil: ctxFotoPerfil,
        descricao: ctxDescricao,
        usuario: ctxNome,
        updateProfile
    } = useAuth();
        
    const { users, loading, error, updateCharacter } = useUsers(usuarioId);

    const [imgPerfil, setImgPerfil] = useState<string>('');
    const [novoNome, setNovoNome] = useState<string>('');
    const [descricao, setDescricao] = useState<string>('');
    const [sucesso, setSucesso] = useState<string | null>(null);
    const [erro, setErro] = useState<string | null>(null);

   
    useEffect(() => {
        const storedNome = localStorage.getItem('usuario_nome') || ctxNome;
        const storedFoto = localStorage.getItem('usuario_foto') || ctxFotoPerfil;
        const storedDescricao = localStorage.getItem('usuario_descricao') || ctxDescricao;

        setNovoNome(storedNome || '');
        setImgPerfil(storedFoto || '');
        setDescricao(storedDescricao || '');
    }, [ctxNome, ctxFotoPerfil, ctxDescricao]);

    // Atualiza com dados da API se retornar algo
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
            reader.onloadend = () => {
                setImgPerfil(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Submete as alterações para o servidor
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
            await updateCharacter(usuarioId, token, {
                nome: novoNome,
                foto_perfil: imgPerfil,
                descricao: descricao
            });

            // Salva no localStorage
            localStorage.setItem('usuario_nome', novoNome);
            localStorage.setItem('usuario_foto', imgPerfil);
            localStorage.setItem('usuario_descricao', descricao);

            // Atualiza no contexto
            updateProfile({
                nome: novoNome,
                foto_perfil: imgPerfil,
                descricao: descricao
            });

        } catch (err) {
            console.error("Erro ao atualizar dados do perfil:", err);
            setErro("Erro ao salvar alterações. Tente novamente.");
        }
    };

    if (loading) {
        return <div className="text-sm text-center py-6" style={{ color: 'var(--profile-text-muted)' }}>Carregando dados do servidor...</div>;
    }

    return (
        <section>
            <form onSubmit={handleSubmit} className={styles.container}>

                {/* CONTAINER DA FOTO */}
                <div className={`flex flex-col justify-center items-center p-2 ${styles.containerFoto}`}>
                    <div className="relative">
                        <img 
                            src={imgPerfil || '/image/semPerfil.jpg'} 
                            alt="Foto Perfil" 
                            className="w-28 h-28 rounded-full object-cover"
                        />
                        
                        <div className="absolute bottom-0 right-1 w-9 h-9 rounded-full flex justify-center items-center shadow-lg transition-colors" style={{
                        backgroundColor: 'var(--profile-modal-bg)',
                        borderColor: 'var(--profile-border)',
                        borderWidth: '1px'
                    }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                            <label htmlFor="foto" title="Alterar foto" className="cursor-pointer flex items-center justify-center w-full h-full" style={{ color: 'var(--text-main)' }}>
                                <FiEdit2 size={14} />
                            </label>
                            <input 
                                id="foto" 
                                type="file" 
                                accept="image/*" 
                                onChange={converterBase64} 
                                className="hidden"
                            />
                        </div>
                    </div>
                    
                    {/* Mensagens de feedback para o desenvolvedor e usuário */}
                    {error && <p className="text-xs mt-2" style={{ color: '#ef4444' }}>{error}</p>}
                    {erro && <p className="text-xs mt-2" style={{ color: '#ef4444' }}>{erro}</p>}
                    {sucesso && <p className="text-xs mt-2" style={{ color: '#10b981' }}>{sucesso}</p>}
                </div>

                {/* INPUT NOME */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="nome">Nome</label>
                    <input 
                        type="text" 
                        id="nome" 
                        placeholder="Nome" 
                        maxLength={20} 
                        minLength={2} 
                        value={novoNome}
                        required
                        onChange={e => {
                            const valor = e.target.value;
                            // Regex que remove caracteres especiais do input
                            const filtrado = valor.replace(/[^A-Za-zÀ-ú0-9 ]/g, '');
                            setNovoNome(filtrado);
                        }}
                    />
                    <p className="text-sm flex justify-end" style={{ color: 'var(--profile-text-muted)' }}>{novoNome.length}/20 caracteres</p>
                </div>

                {/* TEXTAREA DESCRIÇÃO */}
                 <div className="flex flex-col gap-2">
                    <label htmlFor="descricao">Descrição</label>
                     <textarea 
                        placeholder='Descrição' 
                        maxLength={1000}
                        value={descricao}
                        onChange={e => setDescricao(e.target.value)}
                     />
                     <p className="text-sm flex justify-end" style={{ color: 'var(--profile-text-muted)' }}>{descricao.length}/1000 caracteres</p>
                 </div>

                {/* BOTÃO SUBMIT */}
                <input 
                    type="submit" 
                    value="Salvar alterações" 
                    className={`cursor-pointer bg-blue-500 border rounded-lg py-2 ${styles.button}`}
                /> 

            </form>
        </section>
    );
};

export default TapsProfileEdit;