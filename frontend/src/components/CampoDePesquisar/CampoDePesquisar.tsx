import { useState } from 'react';
import styles from './CampoDePesquisar.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { FiSearch } from 'react-icons/fi';

interface CampoDePesquisarProps {
  onSearch?: (resultados: any[]) => void;
  onSearchStart?: () => void;
}

function CampoDePesquisar({ onSearch, onSearchStart }: CampoDePesquisarProps) {
  const [nomePersonagem, setNomePersonagem] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomePersonagem.trim()) return;

    const pesquisa = async () => {
      setIsLoading(true);
      if (onSearchStart) {
        onSearchStart();
      }

      try {
        const url = `${API_URL}/character/search-character?nomePersonagem=${encodeURIComponent(nomePersonagem)}`;
        
        const res = await axios.get(url);
        
        if (res.data.success) {
          if (onSearch) {
            onSearch(res.data.resultados || []);
          } else {
           navigate(`/procurar`, { 
              state: { 
                resultados: res.data.resultados || [],
                termo: nomePersonagem
              } 
            });
          }
          setNomePersonagem("");
        }

      } catch (err) {
        console.error("Erro ao Procurar o personagem:", err);
        if (onSearch) {
          onSearch([]);
        } else {
          navigate(`/procurar`, { state: { resultados: [] } });
        }
        setNomePersonagem("");
      } finally {
        setIsLoading(false);
      }
    }

    pesquisa()
  }

  return (
    <div className={styles.container}>
      <section className={styles.campoPesquisar}>
          <form action="" onSubmit={handleSubmit}>
              <div className={styles.campoPesquisarContainer}>
                  <input 
                    type="text" 
                    value={nomePersonagem} 
                    onChange={(e) => setNomePersonagem(e.target.value)} 
                    placeholder="Procurar personagem" 
                    className={`${styles.input}`}
                    disabled={isLoading}
                  />
                  <button 
                    type='submit' 
                    className={`${styles.botaoPesquisar}`}
                    disabled={isLoading}
                  >
                    <FiSearch />
                  </button>
              </div>
          </form>
      </section>
    </div>
  );
}

export default CampoDePesquisar