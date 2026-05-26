import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './ModalSeguidores.module.css';
import { useNavigate } from "react-router-dom";
import { API_URL } from '../../config/api';

// Corrigido: Seguindor -> Seguidor
interface Seguidor {
    id: number;
    nome?: string;
    foto_perfil?: string | null;
}

interface ModalSeguidoresProps {
    tipo: 'seguidores' | 'seguindo';
    lista?: Seguidor[];  
    onClose: () => void;
    usuario: number;
    usuarioLogado: number;
}

function ModalSeguidores({ tipo, lista = [], onClose, usuario, usuarioLogado }: ModalSeguidoresProps) {
    const [usuarios, setUsuarios] = useState<Seguidor[]>(lista);
    // Adicionado: Estado para gerenciar a aba ativa (permite trocar dentro do modal)
    const [abaAtiva, setAbaAtiva] = useState<'seguidores' | 'seguindo'>(tipo);
    const modalRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Fecha o modal ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Dispara a requisição sempre que o usuário ou a aba ativa mudar
    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                // Simplificação da lógica de endpoint
                const endpoint = abaAtiva === 'seguidores' 
                    ? `${API_URL}/social/users/${usuario}/followers`
                    : `${API_URL}/social/users/${usuario}/following`;

                const res = await axios.get(endpoint);
                setUsuarios(Array.isArray(res.data) ? res.data : []);

            } catch (error) {
                console.error(`Erro ao buscar ${abaAtiva}:`, error);
                setUsuarios([]);
            }
        };

        fetchUsuarios();
    }, [abaAtiva, usuario]);

    return (
        <div className={styles.overlay}>
            <section className={styles.modalVerUsuarios} ref={modalRef}>
                <button className={styles.btnFecharModal} onClick={onClose}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
                
                <div className={`w-full flex justify-center items-center gap-4 mb-4`}>
                    <button 
                        onClick={() => setAbaAtiva('seguidores')}
                        className={abaAtiva === 'seguidores' ? 'font-bold' : ''}
                    >
                        Seguidores
                    </button>
                    <span className="mx-2">|</span>
                    <button 
                        onClick={() => setAbaAtiva('seguindo')}
                        className={abaAtiva === 'seguindo' ? 'font-bold' : ''}
                    >
                        Seguindo
                    </button>
                </div>
                
                <hr className={styles.separacao}/>
                
                {usuarios.length > 0 ? (
                    <ul>
                        {usuarios.map((item) => (
                            <li
                                key={item.id}
                                className={`${styles.listaUsuarios} cursor-pointer hover:bg-neutral-800 transition-colors duration-200`}
                                onClick={() => {
                                    if (item.id === usuarioLogado) {
                                        navigate(`/perfil/${usuarioLogado}`);
                                    } else {
                                        navigate(`/outroperfil/${item.id}`);
                                    }
                                    onClose();
                                }}
                            >
                                <img
                                    src={item.foto_perfil || '/image/semPerfil.jpg'}
                                    alt={item.nome || `Usuário ${item.id}`}
                                    className={`w-8 h-8 rounded-full object-cover shadow-md ${styles.fotoPerfil}`}
                                />
                                {item.nome || `Usuário ${item.id}`}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center mt-4">
                        {abaAtiva === 'seguidores' ? 'Nenhum seguidor' : 'Não está seguindo ninguém'}
                    </p>
                )}
            </section>
        </div>
    );
}

export default ModalSeguidores;