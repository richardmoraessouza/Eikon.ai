"use client";

import React from 'react';
import { useUserSettings } from '../../../../../contexts/UserSettingsContext/UserSettingsContext';
import styles from './TapsPrivacy.module.css';

const TapsPrivacy = () => {
    const { hideFavoriteCharacters, hideRecentCharacters, hideCreatedCharacters, showFrameInChat, updateSetting } = useUserSettings();

    return (
        <div className={styles.privacyContainer}>
            <div className={styles.section}>

                <div className={styles.optionRow}>
                    <span className={styles.optionText}>Não mostrar o histórico de personagens favoritos</span>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={hideFavoriteCharacters}
                            onChange={e => updateSetting('hideFavoriteCharacters', e.target.checked)} />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.optionRow}>
                    <span className={styles.optionText}>Não mostrar o histórico de personagens recentemente falados</span>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={hideRecentCharacters}
                            onChange={e => updateSetting('hideRecentCharacters', e.target.checked)} />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.optionRow}>
                    <span className={styles.optionText}>Não mostrar o histórico de personagens criados</span>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={hideCreatedCharacters}
                            onChange={e => updateSetting('hideCreatedCharacters', e.target.checked)} />
                        <span className={styles.slider}></span>
                    </label>
                </div>

                <div className={styles.optionRow}>
                    <span className={styles.optionText}>Ocultar moldura no chat</span>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={showFrameInChat}
                            onChange={e => updateSetting('showFrameInChat', e.target.checked)} />
                        <span className={styles.slider}></span>
                    </label>
                </div>

            </div>
        </div>
    );
};

export default TapsPrivacy;