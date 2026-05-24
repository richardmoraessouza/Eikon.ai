import { useEffect, useState } from "react";
import styles from "./OutroPerfil.module.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/AuthContext/AuthContext";
import ModalSeguidores from "../../components/ModalSeguidores/ModalSeguidores";
import { API_URL } from "../../config/api";

interface OutroUsuario {
    nome: string;
    foto_perfil: string;
    descricao: string;
}

interface Seguidor {
    id: number;
    nome?: string;
    foto_perfil?: string | null;
}

function OutroPerfil() {

    const [usuarioInfor, setUsuarioInfor] = useState<OutroUsuario | null>(null);
    const [listaSeguidores, setListaSeguidores] = useState<Seguidor[]>([]);
    const [listaSeguindo, setListaSeguindo] = useState<Seguidor[]>([]);
    const [estaSeguindo, setEstaSeguindo] = useState<boolean>(false);
    const [abrirSeguidores, setAbrirSeguidores] = useState<boolean>(false);
    const [abrirSeguindo, setAbrirSeguindo] = useState<boolean>(false);

    const { id } = useParams<{ id: string }>();
    const { usuarioId, token } = useAuth();

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const perfilRes = await axios.get(`${API_URL}/users/other-user/${id}`);
                setUsuarioInfor(perfilRes.data);

                const seguidoresRes = await axios.get(`${API_URL}/social/users/${id}/followers`);
                setListaSeguidores(seguidoresRes.data || []);

                const jaSegue = seguidoresRes.data?.some((s: Seguidor) => s.id === Number(usuarioId));
                setEstaSeguindo(jaSegue || false);

                const seguindoRes = await axios.get(`${API_URL}/social/users/${id}/following`);
                setListaSeguindo(seguindoRes.data || []);
            } catch (error) {
                console.error("Erro ao carregar dados do perfil:", error);
            }
        };

        fetchData();
    }, [id, usuarioId]);

    const seguirUsuario = async () => {
        try {
            if (estaSeguindo) {
                await axios.delete(`${API_URL}/social/unfollow`, {
                    headers: { Authorization: `Bearer ${token}` },
                    data: {
                        seguidor_id: Number(usuarioId),
                        seguido_id: Number(id),
                    }
                });
                setEstaSeguindo(false);
                setListaSeguidores(prev => prev.filter(s => s.id !== Number(usuarioId)));
            } else {
                await axios.post(`${API_URL}/social/follow`, {
                    seguidor_id: Number(usuarioId),
                    seguido_id: Number(id),
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const res = await axios.get(`${API_URL}/users/other-user/${usuarioId}`);

                setEstaSeguindo(true);
                setListaSeguidores(prev => {
                    if (prev.some(s => s.id === Number(usuarioId))) return prev;
                    return [...prev, {
                        id: Number(usuarioId),
                        nome: res.data.nome,
                        foto_perfil: res.data.foto_perfil
                    }];
                });
            }
        } catch (error) {
            console.error("Erro ao seguir/deixar de seguir usuário:", error);
        }
    };

    return (
        <main className={`${styles.containerPerfil} min-h-screen flex flex-col items-center gap-10`}>
            <section className={styles.containerItemsPerfil}>
                {usuarioInfor ? (
                    <div className="flex flex-col items-center mt-10 gap-2">
                        <img src={usuarioInfor.foto_perfil || '/image/semPerfil.jpg'} alt="" className="w-28 h-28 rounded-full shadow-md object-cover"/>
                        <h1 className="mt-4 text-xl font-semibold">{usuarioInfor.nome}</h1>
                        <div className={`text-gray-400 text-sm mt-1 flex flex-row gap-5 ${styles.btnStatus}`}>
                            <button onClick={() => setAbrirSeguidores(true)}>
                                <strong className="text-neutral-300">{listaSeguidores.length}</strong> seguidores
                            </button>
                            <button onClick={() => setAbrirSeguindo(true)}>
                                <strong className="text-neutral-300">{listaSeguindo.length}</strong> seguindo
                            </button>

                            {abrirSeguidores && (
                                <ModalSeguidores 
                                    tipo="seguidores" 
                                    lista={listaSeguidores} 
                                    onClose={() => setAbrirSeguidores(false)} 
                                    usuario={Number(id)}
                                    usuarioLogado={Number(usuarioId)}
                                />
                            )}

                            {abrirSeguindo && (
                                <ModalSeguidores 
                                    tipo="seguindo" 
                                    lista={listaSeguindo} 
                                    onClose={() => setAbrirSeguindo(false)} 
                                    usuario={Number(id)}
                                    usuarioLogado={Number(usuarioId)}
                                />
                            )}
                        </div>

                        <button
                            onClick={seguirUsuario}
                            className={`${estaSeguindo ? styles.btnDeixarSeguir : styles.btnSeguir}`}
                        >
                            {estaSeguindo ? "Deixar de seguir" : "Seguir"}
                        </button>

                        <div className={styles.descricao}>
                            {usuarioInfor.descricao && usuarioInfor.descricao.trim() !== "" ? (
                                <p>{usuarioInfor.descricao}</p>
                            ) : (
                                <p>{usuarioInfor.nome} ainda não tem descrição</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>carregando..</div>
                )}
            </section>
        </main>
    );
}

export default OutroPerfil;