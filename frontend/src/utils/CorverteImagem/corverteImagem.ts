// utils/CorverteImagem/corverteImagem.ts
async function comprimirImagem(base64: string, maxWidth = 250, quality = 0.5): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            const scale = Math.min(1, maxWidth / img.width);
            const canvas = document.createElement('canvas');
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Converte para WebP com compressão alta
            const webpBase64 = canvas.toDataURL('image/webp', quality);
            resolve(webpBase64);
        };
        img.onerror = () => resolve(base64); // fallback
    });
}

// Converte imagem de perfil
export async function converterBase64(e: React.ChangeEvent<HTMLInputElement>, setState?: (value: string) => void) {
    const file = e.target.files?.[0];
    if (!file) return;

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(file.type)) {
        alert('Apenas PNG, JPEG ou WEBP são permitidos!');
        return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64 = reader.result as string;
        const base64Leve = await comprimirImagem(base64, 150, 0.6); // perfil pode ser maior
        setState?.(base64Leve);
    };
    reader.readAsDataURL(file);
}

// Converte figurinha
// export async function converterFigurinha(
//     e: React.ChangeEvent<HTMLInputElement>,
//     index: number,
//     figurinhas: string[],
//     setFigurinhas: (value: string[]) => void
// ) {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
//     if (!tiposPermitidos.includes(file.type)) {
//         alert('Apenas PNG, JPEG ou WEBP são permitidos!');
//         return;
//     }

//     const reader = new FileReader();
//     reader.onloadend = async () => {
//         const base64 = reader.result as string;
//         // Figurinha fica ainda mais leve, qualidade menor
//         const base64Leve = await comprimirImagem(base64, 150, 0.4);

//         const novasFigurinhas = [...figurinhas];
//         novasFigurinhas[index] = base64Leve;
//         setFigurinhas(novasFigurinhas);
//     };
//     reader.readAsDataURL(file);
// }
