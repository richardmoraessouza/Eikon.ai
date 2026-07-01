"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { FiX } from "react-icons/fi";
import { API_URL } from '../../../config/api';
import { FRAME_UPDATED_EVENT, normalizeFrame, type FrameUpdatedDetail } from '../../../utils/frame';
import styles from './ModalSeguidores.module.css';

interface Seguidor {
    id: number;
    nome?: string;
    foto_perfil?: string | null;
    frame?: string | null;
    username?: string | null;
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
    const [abaAtiva, setAbaAtiva] = useState<'seguidores' | 'seguindo'>(tipo);
    const modalRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Fecha o modal ao clicar fora dele
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Busca a lista da aba ativa. Cancela o resultado se a aba/usuário mudar
    // antes da requisição terminar, evitando mostrar a lista errada.
    useEffect(() => {
        let cancelado = false;

        const fetchUsuarios = async () => {
            const endpoint = abaAtiva === 'seguidores'
                ? `${API_URL}/social/users/${usuario}/followers`
                : `${API_URL}/social/users/${usuario}/following`;

            try {
                const res = await axios.get(endpoint);
                if (!cancelado) setUsuarios(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error(`Erro ao buscar ${abaAtiva}:`, error);
                if (!cancelado) setUsuarios([]);
            }
        };

        fetchUsuarios();
        return () => { cancelado = true; };
    }, [abaAtiva, usuario]);

    // Mantém o frame de cada usuário da lista atualizado em tempo real
    useEffect(() => {
        const handler = (event: Event) => {
            const { usuarioId, frame } = (event as CustomEvent<FrameUpdatedDetail>).detail;
            setUsuarios(prev =>
                prev.map(item =>
                    item.id === usuarioId ? { ...item, frame: normalizeFrame(frame) } : item
                )
            );
        };

        window.addEventListener(FRAME_UPDATED_EVENT, handler);
        return () => window.removeEventListener(FRAME_UPDATED_EVENT, handler);
    }, []);

    const irParaPerfil = (item: Seguidor) => {
        if (!item.username) return;
        router.push(`/profile/${item.username}`);
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <section className={styles.modalVerUsuarios} ref={modalRef}>
                <button className={styles.btnFecharModal} onClick={onClose}>
                    <FiX />
                </button>

                <div className={styles.tabs}>
                    <button
                        onClick={() => setAbaAtiva('seguidores')}
                        className={`${styles.tabBtn} ${abaAtiva === 'seguidores' ? styles.ativa : ''}`}
                    >
                        Seguidores
                    </button>
                    <button
                        onClick={() => setAbaAtiva('seguindo')}
                        className={`${styles.tabBtn} ${abaAtiva === 'seguindo' ? styles.ativa : ''}`}
                    >
                        Seguindo
                    </button>
                </div>

                {usuarios.length === 0 ? (
                    <p className={styles.emptyMessage}>
                        {abaAtiva === 'seguidores' ? 'Nenhum seguidor' : 'Não está seguindo ninguém'}
                    </p>
                ) : (
                    <ul>
                        {usuarios.map((item) => {
                            const frameAtivo = normalizeFrame(item.frame);
                            const nomeExibido = item.nome || `Usuário ${item.id}`;

                            return (
                                <li
                                    key={item.id}
                                    className={styles.listaUsuarios}
                                    onClick={() => irParaPerfil(item)}
                                >
                                    <div className={styles.avatarWrap}>
                                        <Image
                                            src={item.foto_perfil || '/image/semPerfil.jpg'}
                                            alt={nomeExibido}
                                            width={56}
                                            height={56}
                                            className={styles.fotoPerfil}
                                            unoptimized
                                        />
                                        {frameAtivo && (
                                            <Image
                                                src={`/image/frames/${frameAtivo}`}
                                                alt="Frame"
                                                width={56}
                                                height={56}
                                                className={styles.frameImg}
                                            />
                                        )}
                                    </div>
                                    <span className={styles.nomeUsuario}>
                                        {nomeExibido}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}

export default ModalSeguidores;