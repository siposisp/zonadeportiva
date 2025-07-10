export function formatText(text) {
    if (typeof text !== 'string') return '';
  
    const unescaped = text
        .replace(/\\r\\n|\\n|\\r/g, '\n')
        .replace(/\r\n|\r/g, '\n')

    const withStrongClass = unescaped.replace(/<strong>/g, '<strong class="font-semibold">');

    const paragraphs = withStrongClass
        .split(/\n{2,}/)
        .map(para => {
            const withBreaks = para.trim().replace(/\n/g, '<br />')
            return `<p>${withBreaks}</p>`
        });

    return paragraphs.join('<br />')
}
