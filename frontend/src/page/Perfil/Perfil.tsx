import React, { useEffect, useState } from 'react';
import styles from './Perfil.module.css';
import axios from 'axios';
import { useAuth } from '../../hooks/AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';
import ModalSeguidores from '../../components/ModalSeguidores/ModalSeguidores';
import { API_URL } from "../../config/api";
import TapsPerfil from '../../components/TapsPerfil/TapsPerfil';

interface UserUpdateResponse {
    success: boolean;
    error?: string;
    usuario_atualizado?: {
        id: number;
        nome: string;
        gmail: string;
        foto_perfil?: string;
        descricao?: string;
    };
}

interface Seguindor {
    id: number;
    nome?: string;
    foto_perfil?: string | null;
}

function Perfil() {

    const { 
        usuario: nomeAtualContexto, 
        usuarioId, 
        fotoPerfil: fotoAtualContexto, 
        token, 
        login,
        logout,
        descricao: descricaoAtualContexto
    } = useAuth();

    const navigate = useNavigate();

    const [imgPerfil, setImgPerfil] = useState<string | null>(fotoAtualContexto || null);
    const [novoNome, setNovoNome] = useState<string>(nomeAtualContexto || ''); 
    const [descricao, setDescricao] = useState<string>(descricaoAtualContexto || '');
    const [erro, setErro] = useState<string>('');

    const [seguidores, setSeguidores] = useState<Seguindor[]>([]);
    const [seguindo, setSeguindo] = useState<Seguindor[]>([]);

    const [abrirSeguidores, setAbrirSeguidores] = useState<boolean>(false);
    const [abrirSeguindo, setAbrirSeguindo] = useState<boolean>(false); 
    
    function abrirModalSeguidores() {
        setAbrirSeguidores(prev => !prev);
    }

    function abrirModalSeguindo() {
        setAbrirSeguindo(prev => !prev);
    }

    useEffect(() => {
    if (!usuarioId || !token) return;

    const carregarDados = async () => {
        try {
            const [seguidoresRes, seguindoRes] = await Promise.all([
                axios.get(
                    `${API_URL}/social/users/${usuarioId}/followers`
                ),
                axios.get(
                    `${API_URL}/social/users/${usuarioId}/following`
                )
            ]);

            setSeguidores(
                Array.isArray(seguidoresRes.data)
                    ? seguidoresRes.data
                    : []
            );

            setSeguindo(
                Array.isArray(seguindoRes.data)
                    ? seguindoRes.data
                    : []
            );

            const usuarioRes = await axios.get(
                `${API_URL}/users/user/${usuarioId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setNovoNome(usuarioRes.data.nome || nomeAtualContexto);
            setImgPerfil(usuarioRes.data.foto_perfil || fotoAtualContexto);
            setDescricao(usuarioRes.data.descricao || '');

        } catch (err) {
            console.error(
                "Erro ao carregar dados do perfil:",
                err
            );
        }
    };

    carregarDados();
}, [usuarioId, token]);

    // Salvar alterações
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');

        if (!usuarioId || !token) {
            setErro("Você precisa estar logado para editar o perfil.");
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
            const res = await axios.put<UserUpdateResponse>(
                `${API_URL}/users/edit-profile/${usuarioId}`,
                {
                    nome: novoNome || nomeAtualContexto,
                    foto_perfil: imgPerfil,
                    descricao
                },
                { headers: { Authorization: `Bearer ${token}` }}
            );

            if (res.data.success && res.data.usuario_atualizado) {
                const dados = res.data.usuario_atualizado;

                login({
                    nome: dados.nome,
                    gmail: dados.gmail,
                    foto_perfil: dados.foto_perfil,
                    descricao: dados.descricao,
                    token,
                    id: usuarioId
                });

                setNovoNome(dados.nome);
                setImgPerfil(dados.foto_perfil || null);
                setDescricao(dados.descricao || '');
            } else {
                setErro(res.data.error || "Erro ao atualizar perfil.");
            }

        } catch (error) {
            console.error("Erro no envio:", error);

            if (axios.isAxiosError(error) && error.response?.status === 401) {
                alert("Sua sessão expirou. Você será redirecionado.");
                logout();
                navigate('/entrar');
            } else {
                setErro("Ops! Tivemos um problema ao atualizar seu perfil. Tente novamente.");
            }
        }
    };

    return (
        <main className={`${styles.containerPerfil} min-h-screen flex flex-col items-center gap-10`}>
        <section className={styles.containerItemsPerfil}>
            <div className="flex flex-col items-center mt-10 gap-2">
                <img src={imgPerfil || '/image/semPerfil.jpg'} alt="Foto Perfil" className="w-28 h-28 rounded-full object-cover" />
                <h1 className="mt-4 text-xl font-semibold">{nomeAtualContexto}</h1>

                <div className={`text-gray-400 text-sm mt-1 flex flex-row gap-1 ${styles.btnStatus}`}>
                    <button onClick={abrirModalSeguidores}>{seguidores.length} Seguidores</button>
                    <button onClick={abrirModalSeguindo}>{seguindo.length} Seguindo</button>

                    {abrirSeguidores && (
                        <ModalSeguidores 
                            tipo="seguidores" 
                            lista={seguidores} 
                            onClose={() => setAbrirSeguidores(false)}
                            usuario={Number(usuarioId)}
                            usuarioLogado={Number(usuarioId)}
                        />
                    )}
                    {abrirSeguindo && (
                        <ModalSeguidores 
                            tipo="seguindo" 
                            lista={seguindo} 
                            onClose={() => setAbrirSeguindo(false)}
                            usuario={Number(usuarioId)}
                            usuarioLogado={Number(usuarioId)}
                        />
                    )}
                </div>



                <div className={styles.descricao}>
                    {descricao ? <p>{descricao}</p> : <p>{nomeAtualContexto} ainda não tem uma descrição</p>}
                </div>
            </div>
        </section>

        <TapsPerfil />
    </main>
    );
}

export default Perfil;