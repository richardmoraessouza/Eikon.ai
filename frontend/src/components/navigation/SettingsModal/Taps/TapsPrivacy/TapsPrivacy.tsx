"use client";

import { useState } from 'react';
import styles from './TapsPrivacy.module.css';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { getCurrentAuthToken } from '@/config/authTokenStore';
import { updateUserService } from '@/services/users/userService';

const TapsPrivacy = () => {
    const {
        usuarioId,
        token,
        loading,
        hideFavoriteCharacter,
        hideRecentCharacter,
        hideFollowers,
        hideFollowing,
        updateProfile,
    } = useAuth();
    const hideFollowLists = hideFollowers || hideFollowing;
    const [saving, setSaving] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<{ success?: string; error?: string }>({});
    const authToken = token ?? getCurrentAuthToken();

    const savePrivacyPreference = async (
        field: 'hide_favorite_character' | 'hide_recent_character' | 'hide_followers' | 'hide_following',
        value: boolean,
    ) => {
        if (loading) {
            return;
        }

        if (!usuarioId) {
            setFeedback({ error: 'Usuário não autenticado.' });
            return;
        }

        if (!authToken) {
            setFeedback({ error: 'Token de autenticação não encontrado.' });
            return;
        }

        setSaving(true);
        setFeedback({});

        try {
            const response = await updateUserService(usuarioId, {
                [field]: value,
            }, authToken);

            const updated = response.usuario_atualizado;
            if (!updated) {
                throw new Error('Usuário não atualizado');
            }

            updateProfile({
                hideFavoriteCharacter: Boolean(updated.hide_favorite_character),
                hideRecentCharacter: Boolean(updated.hide_recent_character),
                hideFollowers: Boolean(updated.hide_followers),
                hideFollowing: Boolean(updated.hide_following),
            });

            setFeedback({ success: 'Preferência salva com sucesso.' });
        } catch (err) {
            console.error('Erro ao atualizar preferências de privacidade:', err);
            updateProfile({
                hideFavoriteCharacter: hideFavoriteCharacter,
                hideRecentCharacter: hideRecentCharacter,
                hideFollowers,
                hideFollowing,
            });
            setFeedback({ error: 'Não foi possível salvar as preferências. Tente novamente.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.privacyContainer}>
            <div className={styles.section}>
                <div className={styles.optionRow}>
                    <div className={styles.optionInfo}>
                        <span className={styles.optionText}>Não mostrar o histórico de personagens favoritos</span>
                    </div>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={hideFavoriteCharacter}
                            disabled={saving}
                            onChange={(event) => {
                                const nextValue = event.target.checked;
                                savePrivacyPreference(
                                    'hide_favorite_character',
                                    nextValue
                                );
                            }}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.optionRow}>
                    <div className={styles.optionInfo}>
                        <span className={styles.optionText}>Não mostrar o histórico de personagens recentemente falados</span>
                    </div>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={hideRecentCharacter}
                            disabled={saving}
                            onChange={(event) => {
                                const nextValue = event.target.checked;
                                savePrivacyPreference(
                                    'hide_recent_character',
                                    nextValue
                                );
                            }}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.optionRow}>
                    <div className={styles.optionInfo}>
                        <span className={styles.optionText}>Ocultar listas de seguidores e seguindo para outros usuários</span>
                    </div>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={hideFollowLists}
                            disabled={saving}
                            onChange={(event) => {
                                const nextValue = event.target.checked;
                                savePrivacyPreference('hide_followers', nextValue);
                                savePrivacyPreference('hide_following', nextValue);
                            }}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                {feedback.success && <div className={styles.feedbackSuccess}>{feedback.success}</div>}
                {feedback.error && <div className={styles.feedbackError}>{feedback.error}</div>}
            </div>
        </div>
    );
};

export default TapsPrivacy;
