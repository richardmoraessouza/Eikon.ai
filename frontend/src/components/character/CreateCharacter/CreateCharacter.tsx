"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './CreateCharacter.module.css';
import { FiEdit2 } from "react-icons/fi";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { useCharacters } from '@/hooks/useCharacters/useCharacters';
import { converterBase64 } from '@/utils/CorverteImagem/corverteImagem';
import { QuickCreateMode } from '@/components/character/quick-create/quick-create';

const validarNome = (texto: string) => {
  const limpo = texto.replace(/[^A-Za-zÀ-ú0-9 ]/g, '');
  return limpo.trim().length > 0 && /[A-Za-zÀ-ú]/.test(limpo) ? limpo : '';
};

function CreateCharacter() {
    const [nome, setNome] = useState('');
    const [bio, setBio] = useState('');
    const [fotoia, setFotoia] = useState('');
    const [historia, setHistoria] = useState('');
    const [personalidade, setPersonalidade] = useState('');
    const [regras, setRegras] = useState('');
    const [genero, setGenero] = useState('');
    const [descricao, setDescricao] = useState('');
    const [obra, setObra] = useState('');
    const [tipo_personagem, setTipo_personagem] = useState('person');
    const [aparencia, setAparencia] = useState('');
    const [gostos, setGostos] = useState('');
    const [desgostos, setDesgostos] = useState('');
    const [objetivos, setObjetivos] = useState('');
    const [primeiraMensagem, setPrimeiraMensagem] = useState('');
    const [relacaoUsuario, setRelacaoUsuario] = useState('');
    const [conversation_style, setConversation_style] = useState<string>('Modo Direto');
    const [cenario, setCenario] = useState('');
    const [quick_prompt, setQuick_prompt] = useState('');
    const [is_modo_rapido, setIs_modo_rapido] = useState(false);
    const [modoRapido, setModoRapido] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [erro, setErro] = useState('');
    const nomeInputRef = useRef<HTMLInputElement>(null);

    const { token, usuarioId, estaLogado, loading } = useAuth();
    const { createCharacter, updateCharacter, searchCharacterById } = useCharacters();
    const router = useRouter();

    // Substitui location.state — lê do localStorage
    const [modoEdicao, setModoEdicao] = useState(false);
    const [personagemId, setPersonagemId] = useState<number | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem("editarPersonagem");
        if (raw) {
            try {
                const data = JSON.parse(raw);
                if (data?.editar && data?.personagem?.id) {
                    setModoEdicao(true);
                    setPersonagemId(data.personagem.id);
                    if (data.personagem.tipo_personagem) {
                        setTipo_personagem(data.personagem.tipo_personagem);
                    }
                }
            } catch {
                // ignorar erro de parse
            }
        }
    }, []);

    useEffect(() => {
        if (!loading && (!estaLogado || !usuarioId)) {
            router.replace('/login');
        }
    }, [loading, estaLogado, usuarioId, router]);

    useEffect(() => {
        const carregarDadosPersonagem = async () => {
            if (modoEdicao && personagemId) {
                try {
                    const dados = await searchCharacterById(personagemId);
                    setNome(dados.nome || '');
                    setBio(dados.bio || '');
                    setHistoria(dados.historia || '');
                    setPersonalidade(dados.personalidade || '');
                    setRegras(dados.regras || '');
                    setGenero(dados.genero || '');
                    setDescricao(dados.descricao || '');
                    setObra(dados.obra || '');
                    setTipo_personagem(dados.tipo_personagem || 'person');
                    setAparencia(dados.aparencia || '');
                    setGostos(dados.gostos || '');
                    setDesgostos(dados.desgostos || '');
                    setObjetivos(dados.objetivos || '');
                    setPrimeiraMensagem(dados.primeiramensagem || '');
                    setRelacaoUsuario(dados.relacaousuario || '');
                    setCenario(dados.cenario || '');
                    setQuick_prompt(dados.quick_prompt || '');
                    setIs_modo_rapido(dados.is_modo_rapido || false);
                    if (dados.fotoia) setFotoia(dados.fotoia);
                } catch (err) {
                    console.error('[CreateCharacter] Erro ao carregar dados do personagem:', err);
                    setErro('Erro ao carregar dados do personagem');
                }
            }
        };

        carregarDadosPersonagem();
    }, [modoEdicao, personagemId, searchCharacterById]);

    const isFiccional = tipo_personagem === 'ficcional';

    const validarFormulario = () => {
        if (!nome.trim()) return "Por favor, insira o nome do personagem.";
        if (nome.length < 2) return "O nome deve ter pelo menos 2 caracteres.";
        if (isFiccional && !obra.trim()) return "Personagens fictícios precisam de uma obra/universo.";
        return null;
    };

    const form = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        const erroValidacao = validarFormulario();
        if (erroValidacao) {
            setErro(erroValidacao);
            nomeInputRef.current?.focus();
            nomeInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        if (loading) {
            setErro("Aguarde enquanto validamos sua sessão...");
            return;
        }

        if (!estaLogado || !usuarioId) {
            setErro("Você precisa estar autenticado para criar um personagem.");
            router.replace('/login');
            return;
        }

        setIsSubmitting(true);
        setErro('');

        try {
            const payload: any = {
                nome, bio, descricao, personalidade, regras, historia,
                tipo_personagem, is_modo_rapido: modoRapido,
                genero, obra,
                aparencia, gostos, desgostos, objetivos,
                primeiramensagem: primeiraMensagem,
                relacaousuario: relacaoUsuario,
                cenario, conversation_style, quick_prompt
            };

            if (fotoia) payload.fotoia = fotoia;

            await (modoEdicao && personagemId
                ? updateCharacter(personagemId, payload, token)
                : createCharacter(usuarioId, payload, token)
            );

            localStorage.removeItem("editarPersonagem");
            router.push(`/perfil/${usuarioId}`);
        } catch (err: any) {
            if (err?.response?.status === 401) {
                setErro("Sua sessão expirou. Por favor, faça login novamente.");
                localStorage.clear();
                router.replace('/login');
                return;
            }
            const mensagemErro = err?.response?.data?.message ||
                                err?.message ||
                                "Falha ao salvar no servidor. Tente novamente mais tarde.";
            setErro(mensagemErro);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={styles.criacaoPerson}>
            <form onSubmit={form} className={styles.containerCriacaoPerson}>
                <div className={styles.tabRow}>
                    <button type="button" onClick={() => setModoRapido(true)} className={`${styles.tabBtn} ${modoRapido ? styles.tabActive : ''}`}>
                        <i className="fa-solid fa-bolt" style={{ marginRight: '6px', fontSize: '12px' }}></i>
                        Criação Rápida
                    </button>
                    <button type="button" onClick={() => setModoRapido(false)} className={`${styles.tabBtn} ${!modoRapido ? styles.tabActive : ''}`}>
                        <i className="fa-solid fa-sliders" style={{ marginRight: '6px', fontSize: '12px' }}></i>
                        Criação Completa
                    </button>
                    <button type="button" onClick={() => setTipo_personagem('person')} className={`${styles.tabBtn} ${tipo_personagem === 'person' ? styles.tabActive : ''}`}>
                        <i className="fa-solid fa-user" style={{ marginRight: '6px', fontSize: '12px' }}></i>
                        Original
                    </button>
                    <button type="button" onClick={() => setTipo_personagem('ficcional')} className={`${styles.tabBtn} ${tipo_personagem === 'ficcional' ? styles.tabActive : ''}`}>
                        <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: '6px', fontSize: '12px' }}></i>
                        Fictício
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto', marginBottom: '20px' }}>
                        <img
                            src={fotoia || "/image/semPerfil.jpg"}
                            alt="Pré-visualização"
                            style={{ width: '104px', height: '104px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div
                            onClick={() => document.getElementById('fotoia')?.click()}
                            style={{
                                position: 'absolute', bottom: '0', right: '0',
                                background: 'var(--bg-main)', width: '36px', height: '36px',
                                borderRadius: '50%', display: 'flex', justifyContent: 'center',
                                alignItems: 'center', border: '2px solid var(--text-main)', cursor: 'pointer'
                            }}
                        >
                            <FiEdit2 size={16} />
                            <input id="fotoia" type="file" onChange={(e) => converterBase64(e, setFotoia)} accept="image/*" style={{ display: 'none' }} />
                        </div>
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', margin: '20px 0 0 0' }}>
                        {modoEdicao ? "Editar personagem" : isFiccional ? "Crie Seu Personagem fictício" : "Criar personagem"}
                    </h1>
                    {erro && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>{erro}</p>}
                </div>

                {modoRapido ? (
                    <QuickCreateMode
                        nome={nome} bio={bio} descricao={descricao} obra={obra}
                        quick_prompt={quick_prompt} conversation_style={conversation_style}
                        isFiccional={isFiccional} is_modo_rapido={is_modo_rapido}
                        onNomeChange={setNome} onBioChange={setBio} onDescricaoChange={setDescricao}
                        onObraChange={setObra} onConversationStyleChange={setConversation_style}
                        onQuick_prompt={setQuick_prompt} onIs_modo_rapido={setIs_modo_rapido}
                    />
                ) : (
                    <>
                        <div className={styles.formGroup}>
                            <label>Nome</label>
                            <input ref={nomeInputRef} type="text" placeholder="Nome" maxLength={20} value={nome} required
                                onChange={(e) => setNome(validarNome(e.target.value))} />
                            <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{nome.length}/20 palavras</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Bio</label>
                            <input type="text" placeholder="Uma descrição breve" value={bio} maxLength={50}
                                onChange={(e) => setBio(e.target.value)} />
                            <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{bio.length}/50 palavras</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Gênero</label>
                            <input type="text" placeholder="Qual é o gênero?" value={genero} maxLength={20}
                                onChange={(e) => setGenero(e.target.value)} />
                            <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{genero.length}/20 palavras</p>
                        </div>

                        {isFiccional && (
                            <>
                                <div className={styles.formGroup}>
                                    <label>Obra / Universo</label>
                                    <input type="text" value={obra} placeholder="De qual obra/universo é este personagem?"
                                        required={isFiccional} maxLength={50} onChange={(e) => setObra(e.target.value)} className={styles.textarea} />
                                    <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{obra.length}/50 palavras</p>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Cenário</label>
                                    <textarea id="cenário" value={cenario} maxLength={200}
                                        placeholder="Descreva o cenário em que o personagem vive?"
                                        onChange={(e) => setCenario(e.target.value)} className={styles.textarea} />
                                    <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{cenario.length}/200 palavras</p>
                                </div>
                            </>
                        )}

                        <div className={styles.formGroup}>
                            <label>Descrição</label>
                            <textarea placeholder="Descrição para seu personagem" value={descricao}
                                onChange={(e) => setDescricao(e.target.value)} maxLength={500} />
                            <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{descricao.length}/500 caracteres</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label>História / Backstory</label>
                            <textarea placeholder="Qual é a história deste personagem?" value={historia} maxLength={500}
                                onChange={(e) => setHistoria(e.target.value)} />
                            <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{historia.length}/500 palavras</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Personalidade</label>
                            <textarea placeholder="Quais são seus traços de personalidade?" value={personalidade} maxLength={200}
                                onChange={(e) => setPersonalidade(e.target.value)} />
                            <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{personalidade.length}/200 palavras</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Aparência</label>
                            <textarea placeholder="Como o personagem se parece?" value={aparencia} maxLength={200}
                                onChange={(e) => setAparencia(e.target.value)} />
                            <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{aparencia.length}/200 palavras</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Gostos</label>
                            <textarea placeholder="O que ele gosta?" value={gostos} maxLength={200}
                                onChange={(e) => setGostos(e.target.value)} />
                            <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{gostos.length}/200 palavras</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Desgostos</label>
                            <textarea placeholder="O que ele não gosta?" value={desgostos} maxLength={200}
                                onChange={(e) => setDesgostos(e.target.value)} />
                            <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{desgostos.length}/200 palavras</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Relação com o Usuário</label>
                            <textarea placeholder="Como o personagem se relaciona com o usuário?" value={relacaoUsuario} maxLength={200}
                                onChange={(e) => setRelacaoUsuario(e.target.value)} />
                            <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{relacaoUsuario.length}/200 palavras</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Objetivos</label>
                            <textarea placeholder="Quais são os objetivos deste personagem?" value={objetivos} maxLength={200}
                                onChange={(e) => setObjetivos(e.target.value)} />
                            <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{objetivos.length}/200 palavras</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Primeira Mensagem</label>
                            <textarea placeholder="Como o personagem deve saudar o usuário pela primeira vez?" value={primeiraMensagem} maxLength={200}
                                onChange={(e) => setPrimeiraMensagem(e.target.value)} />
                            <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{primeiraMensagem.length}/200 palavras</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Regras</label>
                            <textarea placeholder="Defina as regras de comportamento do personagem" value={regras} maxLength={200}
                                onChange={(e) => setRegras(e.target.value)} />
                            <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{regras.length}/200 palavras</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="Como ele conversa?">Como ele conversa?</label>
                            <select id="Como ele conversa?" value={conversation_style}
                                onChange={(e) => setConversation_style(e.target.value)} className={styles.selectEstilo}>
                                <option value="Modo Direto">Estilo Ágil (Casual/Direto)</option>
                                <option value="narrativo">Estilo Imersivo (Narrativo)</option>
                                <option value="robotico">Robótico (Lógico/Analítico)</option>
                                <option value="dinamico">Dinâmico (Híbrido)</option>
                                <option value="assistente">Assistente (Prestativo/Formal)</option>
                            </select>
                        </div>
                    </>
                )}

                <input type="submit" value={isSubmitting ? "Salvando..." : "Salvar"} className={styles.submitButton} />
            </form>
        </main>
    );
}

export default CreateCharacter;