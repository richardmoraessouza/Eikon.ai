import React, { useState, useEffect } from 'react';
import styles from './CriacaoPerson.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../hooks/AuthContext/AuthContext';
import { converterBase64 } from '../../utils/CorverteImagem/corverteImagem';

function CriacaoPerson() {
    const [historia, setHistoria] = useState('');
    const [personalidade, setPersonalidade] = useState('');
    const [fotoia, setFotoia] = useState('');
    const [comportamento, setComportamento] = useState('');
    const [regras, setRegras] = useState('');
    const [genero, setGenero] = useState('');
    const [descricao, setDescricao] = useState('');
    const [estilo, setEstilo] = useState('');
    const [nome, setNome] = useState('');
    const [tipo_personagem, setTipo_personagem] = useState('person');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [erro, setErro] = useState('');
    const [bio, setBio] = useState<string>('');

    const location = useLocation();
    const modoEdicao = location.state?.editar || false;
    const personagemState = location.state?.personagem || null;
    const id = personagemState?.id;

    const { token, usuarioId } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPersonagem = async () => {
            if (modoEdicao && id) {
                try {
                    const response = await axios.get(`${API_URL}/character/data-character/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const p = response.data.personagem;

                    setNome(p.nome || '');
                    setGenero(p.genero || '');
                    setDescricao(p.descricao || '');
                    setFotoia(p.fotoia || '');
                    setPersonalidade(p.personalidade || '');
                    setComportamento(p.comportamento || '');
                    setRegras(p.regras || '');
                    setEstilo(p.estilo || '');
                    setHistoria(p.historia || '');
                    setTipo_personagem(p.tipo_personagem || 'person');
                    setBio(p.bio || '');
                } catch (err) {
                    console.error("Erro ao buscar personagem:", err);
                    alert('Não foi possível carregar os dados do personagem.');
                }
            } else if (personagemState) {
                setNome(personagemState.nome || '');
                setGenero(personagemState.genero || '');
                setDescricao(personagemState.descricao || '');
                setFotoia(personagemState.fotoia || '');
                setPersonalidade(personagemState.personalidade || '');
                setComportamento(personagemState.comportamento || '');
                setRegras(personagemState.regras || '');
                setEstilo(personagemState.estilo || '');
                setHistoria(personagemState.historia || '');
                setTipo_personagem(personagemState.tipo_personagem || 'person');
                setBio(personagemState.bio || '');
            }
        };

        fetchPersonagem();
    }, [modoEdicao, id, personagemState, token]);

    const form = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;
        setIsSubmitting(true);
        setErro('');

           // Não pode ter caracteres especiais
        if (/[^A-Za-zÀ-ú0-9 ]/.test(nome)) {
            setErro("O nome contém caracteres inválidos.");
            return;
        }
        // Deve ter pelo menos uma letra
        if (!/[A-Za-zÀ-ú]/.test(nome)) {
            setErro("O nome deve conter letras.");
            return;
        }

        try {

            const payload = {
                nome, bio, descricao, fotoia, comportamento, estilo, genero,
                personalidade, regras, historia, tipo_personagem,
            };

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const url = modoEdicao ? `${API_URL}/character/update-character/${id}` : `${API_URL}/character/create-character/${usuarioId}`;
            
            console.log("Token enviado:", token);
            if (modoEdicao) {
                await axios.put(url, payload, config);
            } else {
                await axios.post(url, payload, config);
            }
            
            console.log("Resposta do servidor:", url, payload);
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
                        <h1 className="text-center text-xl font-bold my-6">{modoEdicao ? "Editar personagem" : "Criar personagem"}</h1>
                        {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
                    </div>

                    {/* Campos */}
                    <div>
                        <label htmlFor="nome">Nome</label>
                        <input type="text" id="nome" placeholder="Digite o nome do personagem" value={nome} maxLength={20} onChange={(e) => setNome(e.target.value.replace(/[^A-Za-zÀ-ú0-9 ]/g, ''))} required />
                        <p className="text-gray-400 text-sm flex justify-end">{nome.length}/20 caracteres</p>
                    </div>

                      <div>
                        <label htmlFor="bio">Bio</label>
                        <input
                            type="text"
                            placeholder="Digite a bio do personagem"
                            value={bio}
                            id="bio"
                            maxLength={50}
                            onChange={(e) => setBio(e.target.value)}
                        />
                        <p className="text-gray-400 text-sm flex justify-end">
                            {bio.length}/50 caracteres
                        </p>
                    </div>

                    <div>
                        <label htmlFor="genero">Gênero</label>
                        <input type="text" id="genero" placeholder="Digite o gênero personagem" value={genero} maxLength={20} onChange={(e) => setGenero(e.target.value)} />
                    </div>

                    <div>
                        <label htmlFor="descricao">Descrição</label>
                        <textarea
                            placeholder='Digite a descrição do personagem'
                            id="descricao" 
                            value={descricao} maxLength={500} 
                            onChange={(e) => setDescricao(e.target.value)} />
                            <p className="text-gray-400 text-sm flex justify-end">{descricao.length}/200</p>
                    </div>

                    <div>
                        <label htmlFor='historia'>História</label>
                        <textarea value={historia} id="historia" placeholder='Digite a História do personagem' onChange={(e) => setHistoria(e.target.value)} />
                    </div>

                    <div>
                        <label htmlFor='personalidade'>Personalidade</label>
                        <textarea value={personalidade} id="personalidade" placeholder='Digite a personalidade do personagem' onChange={(e) => setPersonalidade(e.target.value)} />
                    </div>

                    <div>
                        <label htmlFor='estilo'>Estilo</label>
                        <textarea value={estilo} id= "estilo" placeholder="Digite o estilo do personagem" onChange={(e) => setEstilo(e.target.value)} />
                    </div>

                    <div>
                        <label htmlFor='comportamento'>Comportamento</label>
                        <textarea value={comportamento} id="comportamento" placeholder="Digite o comportamento do personagem" onChange={(e) => setComportamento(e.target.value)} />
                    </div>

                    <div>
                        <label htmlFor='regras'>Regras</label>
                        <textarea id="regras" placeholder="Digite as regras para seu personagem" value={regras} onChange={(e) => setRegras(e.target.value)} />
                    </div>

                    <input 
                        type="submit" 
                        value={isSubmitting ? "Criando..." : "Criar"} 
                        disabled={isSubmitting} 
                        className="bg-blue-500 border rounded-lg py-2 cursor-pointer hover:bg-blue-600 transition"
                    />
                </form>
            </section>
        </main>
    );
}

export default CriacaoPerson;
