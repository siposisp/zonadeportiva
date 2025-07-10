export default function CatalogResults({ results }) {
    return (
        <p className="text-xs md:text-sm">
            <span className="font-semibold">{results}</span> resultados encontrados
        </p>
    )
}