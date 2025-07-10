export const formatCLP = (price) => {
    const numericPrice = Number(price);

    if (!numericPrice || isNaN(numericPrice)) return null;

    return numericPrice.toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    });
};