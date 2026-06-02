import React, { useState, useEffect } from 'react';
import styles from './CriacaoPerson.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext/AuthContext';
import { useCharacters } from '../../hooks/useCharacters/useCharacters';
import { converterBase64 } from '../../utils/CorverteImagem/corverteImagem';

function CriacaoPersonagem() {
    const [historia, setHistoria] = useState('');
    const [personalidade, setPersonalidade] = useState('');
    const [fotoia, setFotoia] = useState('');
    const [comportamento, setComportamento] = useState('');
    const [regras, setRegras] = useState('');
    const [genero, setGenero] = useState('');
    const [descricao, setDescricao] = useState('');
    const [estilo, setEstilo] = useState('');
    const [nome, setNome] = useState('');
    const [obra, setObra] = useState('');
    const [tipo_personagem, setTipo_personagem] = useState('person');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [erro, setErro] = useState('');
    const [bio, setBio] = useState<string>('');

    const location = useLocation();
    const modoEdicao = location.state?.editar || false;
    const personagemState = location.state?.personagem || null;
    const id = personagemState?.id;

    const { token, usuarioId } = useAuth();
    const { createCharacter, updateCharacter, searchCharacterById } = useCharacters();
    const navigate = useNavigate();

    const isFiccional = tipo_personagem === 'ficcional';

    useEffect(() => {
        if (!modoEdicao) {
            setTipo_personagem(location.state?.tipo || 'person');
        }
    }, [location.key]);

    useEffect(() => {
        if (!modoEdicao || !id) return;

        const fetchPersonagem = async () => {
            try {
                const p = await searchCharacterById(id);

                setNome(p.nome || '');
                setGenero(p.genero || '');
                setDescricao(p.descricao || '');
                setFotoia(p.fotoia || '');
                setPersonalidade(p.personalidade || '');
                setComportamento(p.comportamento || '');
                setRegras(p.regras || '');
                setEstilo(p.estilo || '');
                setHistoria(p.historia || '');
                setObra(p.obra || '');
                setTipo_personagem(p.tipo_personagem || 'person');
                setBio(p.bio || '');
            } catch (err) {
                console.error("Erro ao buscar personagem:", err);
        }
    };

    fetchPersonagem();
}, [modoEdicao, id]);

    const form = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;
        setIsSubmitting(true);
        setErro('');

        if (/[^A-Za-zÀ-ú0-9 ]/.test(nome)) {
            setErro("O nome contém caracteres inválidos.");
            setIsSubmitting(false);
            return;
        }
        if (!/[A-Za-zÀ-ú]/.test(nome)) {
            setErro("O nome deve conter letras.");
            setIsSubmitting(false);
            return;
        }
        if (isFiccional && !obra.trim()) {
            setErro("O nome da obra não pode estar vazio.");
            setIsSubmitting(false);
            return;
        }

        if (!token) {
            setErro("Você precisa estar logado.");
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                nome, bio, descricao, fotoia, personalidade, regras, historia, tipo_personagem,
                ...(isFiccional
                    ? { obra }
                    : { genero, comportamento, estilo }),
            };

            if (modoEdicao) {
                await updateCharacter(id, payload, token);
            } else {
                await createCharacter(Number(usuarioId), payload, token);
            }

            navigate(`/perfil/${usuarioId}`);
        } catch (err: any) {
            setErro(err.response?.data?.details || "Erro ao salvar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={styles.criacaoPerson}>
            <section className={styles.containerCriacaoPerson}>
                <form onSubmit={form}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto', marginBottom: '20px' }}>
                            <img
                                src={fotoia || "/image/semPerfil.jpg"}
                                alt="Pré-visualização"
                                style={{
                                    width: '104px',
                                    height: '104px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                background: 'var(--bg-main)',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                border: '2px solid var(--text-main)'
                            }}>
                                <label htmlFor="foto" style={{ cursor: 'pointer', margin: 0, color: 'var(--text-main)' }}>
                                    <i className="fa-solid fa-pen"></i>
                                </label>
                                <input id="foto" type="file" onChange={(e) => converterBase64(e, setFotoia)} accept="image/*" style={{ display: 'none' }} />
                            </div>
                        </div>
                        <h1 style={{ fontSize: '20px', fontWeight: '700', margin: '20px 0 0 0' }}>
                            {modoEdicao ? "Editar personagem" : isFiccional ? "Crie Seu Personagem fictício" : "Criar personagem"}
                        </h1>
                        {erro && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>{erro}</p>}
                    </div>

                    <div>
                        <label htmlFor="nome">Nome</label>
                        <input type="text" id="nome" placeholder="Digite o nome do personagem" value={nome} maxLength={20} minLength={2} required onChange={(e) => setNome(e.target.value.replace(/[^A-Za-zÀ-ú0-9 ]/g, ''))} />
                        <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{nome.length}/20 caracteres</p>
                    </div>

                    <div>
                        <label htmlFor="bio">Bio</label>
                        <input type="text" placeholder="Digite a bio do personagem" value={bio} id="bio" maxLength={50} onChange={(e) => setBio(e.target.value)} />
                        <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{bio.length}/50 caracteres</p>
                    </div>

                    {!isFiccional && (
                        <div>
                            <label htmlFor="genero">Gênero</label>
                            <input type="text" id="genero" placeholder="Digite o gênero personagem" value={genero} maxLength={20} onChange={(e) => setGenero(e.target.value)} />
                        </div>
                    )}

                    {isFiccional && (
                        <div>
                            <label htmlFor="obra">Obra</label>
                            <textarea
                                id="obra"
                                value={obra}
                                placeholder='Digite Nome da obra'
                                required
                                minLength={2}
                                maxLength={50}
                                onChange={(e) => setObra(e.target.value.replace(/[^A-Za-zÀ-ú0-9 ]/g, ''))}
                            ></textarea>
                            <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{obra.length}/50 caracteres</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="descricao">Descrição</label>
                        <textarea
                            placeholder='Digite a descrição do personagem'
                            id="descricao"
                            value={descricao} maxLength={500}
                            onChange={(e) => setDescricao(e.target.value)} />
                        <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{descricao.length}/500 caracteres</p>
                    </div>

                    <div>
                        <label htmlFor='historia'>História</label>
                        <textarea value={historia} id="historia" placeholder='Digite a História do personagem' onChange={(e) => setHistoria(e.target.value)} />
                    </div>

                    <div>
                        <label htmlFor='personalidade'>Personalidade</label>
                        <textarea value={personalidade} id="personalidade" placeholder='Digite a personalidade do personagem' onChange={(e) => setPersonalidade(e.target.value)} />
                    </div>

                    {!isFiccional && (
                        <div>
                            <label htmlFor='estilo'>Estilo</label>
                            <textarea value={estilo} id="estilo" placeholder="Digite o estilo do personagem" onChange={(e) => setEstilo(e.target.value)} />
                        </div>
                    )}

                    {!isFiccional && (
                        <div>
                            <label htmlFor='comportamento'>Comportamento</label>
                            <textarea value={comportamento} id="comportamento" placeholder="Digite o comportamento do personagem" onChange={(e) => setComportamento(e.target.value)} />
                        </div>
                    )}

                    <div>
                        <label htmlFor='regras'>Regras</label>
                        <textarea id="regras" placeholder="Digite as regras para seu personagem" value={regras} onChange={(e) => setRegras(e.target.value)} />
                    </div>

                    <input
                        type="submit"
                        value={isSubmitting ? "Salvando..." : modoEdicao ? "Salvar" : "Criar"}
                        disabled={isSubmitting}
                    />
                </form>
            </section>
        </main>
    );
}

export default CriacaoPersonagem;