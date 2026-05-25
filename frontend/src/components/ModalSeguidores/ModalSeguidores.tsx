import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './ModalSeguidores.module.css';
import { useNavigate } from "react-router-dom";
import { API_URL } from '../../config/api';

interface Seguindor {
    id: number;
    nome?: string;
    foto_perfil?: string | null;
}

interface ModalSeguidoresProps {
    tipo: 'seguidores' | 'seguindo';
    lista?: Seguindor[];  
    onClose: () => void;
    usuario: number;
    usuarioLogado: number;
}

function ModalSeguidores({ tipo, lista = [], onClose, usuario, usuarioLogado }: ModalSeguidoresProps) {
    const [usuarios, setUsuarios] = useState<Seguindor[]>(lista);
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

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                if (tipo === 'seguidores') {
                    const res = await axios.get(
                        `${API_URL}/social/users/${usuario}/followers`
                    );

                    setUsuarios(Array.isArray(res.data) ? res.data : []);

                } else {
                    const res = await axios.get(
                        `${API_URL}/social/users/${usuario}/following`
                    );

                    setUsuarios(Array.isArray(res.data) ? res.data : []);
                }

            } catch (error) {
                console.error(`Erro ao buscar ${tipo}:`, error);
                setUsuarios([]);
            }
        };

        fetchUsuarios();
    }, [tipo, usuario]);

    return (
        <div className={styles.overlay}>
            <section className={styles.modalVerUsuarios} ref={modalRef}>
                <button className={styles.btnFecharModal} onClick={onClose}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
                <h2 className={styles.titulo}>{tipo === 'seguidores' ? 'Seguidores' : 'Seguindo'}</h2>
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
                    <p className="text-center">
                        {tipo === 'seguidores' ? 'Sem seguidores' : 'Seguindo ninguém'}
                    </p>
                )}
            </section>
        </div>
    );
}

export default ModalSeguidores;
