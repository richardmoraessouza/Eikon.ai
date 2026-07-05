"use client";

import styles from './TapsPrivacy.module.css';

const options = [
    {
        id: 'hide-favorites',
        label: 'Não mostrar o histórico de personagens favoritos',
    },
    {
        id: 'hide-recent',
        label: 'Não mostrar o histórico de personagens recentemente falados',
    },
    {
        id: 'hide-created',
        label: 'Não mostrar o histórico de personagens criados',
    },
    {
        id: 'hide-frame',
        label: 'Ocultar moldura no chat',
    },
];

const TapsPrivacy = () => {
    return (
        <div className={styles.privacyContainer}>
            <div className={styles.section}>
                {options.map((option) => (
                    <div key={option.id} className={styles.optionRow}>
                        <div className={styles.optionInfo}>
                            <span className={styles.optionText}>{option.label}</span>
                        </div>
                        <label className={styles.switch}>
                            <input type="checkbox" id={option.id} />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TapsPrivacy;