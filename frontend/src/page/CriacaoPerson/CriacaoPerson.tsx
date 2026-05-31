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
                <form className='flex flex-col gap-4' onSubmit={form}>
                    <div className='w-full flex justify-center items-center'>
                        <div className='relative'>
                            <img
                                src={fotoia || "/image/semPerfil.jpg"}
                                alt="Pré-visualização"
                                className='w-26 h-26 rounded-full object-cover'
                            />
                            <div className='absolute bottom-0 right-0 bg-gray-900 w-9 h-9 text-xl rounded-full flex justify-center items-center'>
                                <label htmlFor="foto">
                                    <i className="fa-solid fa-pen cursor-pointer"></i>
                                </label>
                                <input id="foto" type="file" onChange={(e) => converterBase64(e, setFotoia)} accept="image/*" className="hidden" />
                            </div>
                        </div>
                        <h1 className="text-center text-xl font-bold my-6">
                            {modoEdicao ? "Editar personagem" : isFiccional ? "Crie Seu Personagem fictício" : "Criar personagem"}
                        </h1>
                        {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
                    </div>

                    <div>
                        <label htmlFor="nome">Nome</label>
                        <input type="text" id="nome" placeholder="Digite o nome do personagem" value={nome} maxLength={20} minLength={2} required onChange={(e) => setNome(e.target.value.replace(/[^A-Za-zÀ-ú0-9 ]/g, ''))} />
                        <p className="text-gray-400 text-sm flex justify-end">{nome.length}/20 caracteres</p>
                    </div>

                    <div>
                        <label htmlFor="bio">Bio</label>
                        <input type="text" placeholder="Digite a bio do personagem" value={bio} id="bio" maxLength={50} onChange={(e) => setBio(e.target.value)} />
                        <p className="text-gray-400 text-sm flex justify-end">{bio.length}/50 caracteres</p>
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
                            <p className="text-gray-400 text-sm flex justify-end">{obra.length}/50 caracteres</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="descricao">Descrição</label>
                        <textarea
                            placeholder='Digite a descrição do personagem'
                            id="descricao"
                            value={descricao} maxLength={500}
                            onChange={(e) => setDescricao(e.target.value)} />
                        <p className="text-gray-400 text-sm flex justify-end">{descricao.length}/500 caracteres</p>
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
                        className="bg-blue-500 border rounded-lg py-2 cursor-pointer hover:bg-blue-600 transition"
                    />
                </form>
            </section>
        </main>
    );
}

export default CriacaoPersonagem;