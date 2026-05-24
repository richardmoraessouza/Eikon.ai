import React, { useState, useEffect } from 'react';
import styles from './Person_ficticio.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/AuthContext/AuthContext';
import { useLocation } from 'react-router-dom';
import { API_URL } from '../../config/api';
import { converterBase64 } from '../../utils/CorverteImagem/corverteImagem';

function CriacaoPerson() {
    const [fotoia, setFotoia] = useState<string>('');
    const [regras, setRegras] = useState<string>('');
    const [descricao, setDescricao] = useState<string>("")
    const [nome, setNome] = useState<string>('');
    const [erro, setErro] = useState<string>('');
    const [personalidade, setPersonalidade] = useState<string>('');
    const [obra, setObra] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tipo_personagem, setTipo_personagem] = useState<string>('ficcional');
    const [historia, setHistoria] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const { token, usuarioId } = useAuth();

    const location = useLocation();
    const modoEdicao = location.state?.editar || false;
    const personagemState = location.state?.personagem || null;
    const id = personagemState?.id;
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
                    setObra(p.obra || '')
                    setDescricao(p.descricao || '');
                    setFotoia(p.fotoia || '');
                    setPersonalidade(p.personalidade || '');
                    setRegras(p.regras || '');
                    setHistoria(p.historia || '');
                    setTipo_personagem(p.tipo_personagem || 'person');
                    setBio(p.bio || '');
                } catch (err) {
                    console.error("Erro ao buscar personagem:", err);
                    alert('Não foi possível carregar os dados do personagem.');
                }
            } else if (personagemState) {
                setNome(personagemState.nome || '');
                setObra(personagemState.obra || "");
                setDescricao(personagemState.descricao || '');
                setFotoia(personagemState.fotoia || '');
                setPersonalidade(personagemState.personalidade || '');     
                setRegras(personagemState.regras || '');
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
        setErro("");
    

        // Não pode ter caracteres especiais
        if (/[^A-Za-zÀ-ú0-9 ]/.test(nome)) {
            setErro("O nome contém caracteres inválidos.");
            setIsSubmitting(false);
            return;
        }
        // Deve ter pelo menos uma letra
        if (!/[A-Za-zÀ-ú]/.test(nome)) {
            setErro("O nome deve conter letras.");
            setIsSubmitting(false);
            return;
        }
        
        if (!obra.trim()) {
            setErro("O nome da obra não pode estar vazio.");
            setIsSubmitting(false);
            return;
       }
      
        try {

            const data = { 
                fotoia, nome, personalidade, historia, regras, 
                descricao, obra, tipo_personagem, bio
            };

            if (modoEdicao && id) {
                await axios.put(`${API_URL}/character/update-character/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                const res = await axios.post(`${API_URL}/character/create-character/${usuarioId}`, data, { headers: { Authorization: `Bearer ${token}` } });
                console.log(res.data)
            }

            navigate(`/perfil/${usuarioId}`);
            } catch (err) {
                console.error('Erro ao criar/editar personagem:', err);
                setErro('Ocorreu um erro ao enviar. Tente novamente.');
            } finally {
                setIsSubmitting(false);
            }
    };

    return (
        <main className={styles.criacaoPerson}>
            <section className={styles.containerCriacaoPerson}>

                <form className='flex flex-col gap-4' onSubmit={form}>

                    {/* FOTO DE PERFIL */}
                    <div className='w-full flex justify-center items-center'>
                        <div className='relative'>
                            <img 
                                src={fotoia || "/image/semPerfil.jpg"} 
                                alt="Pré-visualização da imagem" 
                                className='w-26 h-26 rounded-full object-cover'
                            />
                            
                            <div className='absolute bottom-0 right-0 bg-gray-900 w-9 h-9 text-xl rounded-full flex justify-center items-center'>
                                <label htmlFor="foto" title="Adicionar imagem">
                                    <i className="fa-solid fa-pen cursor-pointer"></i>
                                </label>
                                <input 
                                    id="foto" 
                                    type="file" 
                                    onChange={(e) => converterBase64(e, setFotoia)}
                                    accept="image/*" 
                                    className="hidden" 
                                />
                            </div>
                        </div>
                      <h1 className="text-center text-1xl font-bold my-6">
                         Crie Seu Personagem fictício
                      </h1>
                      {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="nome">Nome</label>
                        <input
                            type="text"
                            placeholder="Digite o nome do personagem"
                            required
                            value={nome}
                            id="nome"
                            maxLength={20}
                            minLength={2}
                            onChange={(e) => {
                                const valor = e.target.value;
                                const filtrado = valor.replace(/[^A-Za-zÀ-ú0-9 ]/g, '');
                                setNome(filtrado);
                            }}
                        />
                        <p className="text-gray-400 text-sm flex justify-end">
                            {nome.length}/20 caracteres
                        </p>
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
                        <label htmlFor="obra">Obra</label>
                        <textarea 
                            id="obra"
                            value={obra}
                            placeholder='Digite Nome da obra'
                            required
                            minLength={2}
                            maxLength={50}
                            onChange={(e) => {
                                const valor = e.target.value;
                                const filtrado = valor.replace(/[^A-Za-zÀ-ú0-9 ]/g, '');
                                setObra(filtrado);
                            }}
                        ></textarea>
                        <p className="text-gray-400 text-sm flex justify-end">
                            {obra.length}/50 caracteres
                        </p>
                    </div>

                    <div>
                        <label htmlFor="descricao">Descrição</label>
                        <textarea 
                            id="descricao" 
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            maxLength={200}
                            placeholder="Aparecerá no perfil do personagem"
                        ></textarea>
                        <p className="text-gray-400 text-sm flex justify-end">
                            {descricao.length}/500 caracteres
                        </p>
                    </div>

                    <div>
                        <label htmlFor="historia">História</label>
                        <textarea 
                            id="historia"
                            value={historia}
                            onChange={(e) => setHistoria(e.target.value)} 
                            placeholder='Digite uma Nova história'
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="personalidade">Personalidade</label>
                        <textarea 
                            id="personalidade"
                            value={personalidade}
                            onChange={(e) => setPersonalidade(e.target.value)} 
                            placeholder='Digite uma nova personalidade'
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="regras">Regras</label>
                        <textarea 
                            id="regras"
                            value={regras}
                            onChange={(e) => setRegras(e.target.value)} 
                            placeholder='Digite as regras'
                        ></textarea>
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
    )
}

export default CriacaoPerson;