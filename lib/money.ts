export const rupiah = (v: number | string | {toString(): string}) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(v));
