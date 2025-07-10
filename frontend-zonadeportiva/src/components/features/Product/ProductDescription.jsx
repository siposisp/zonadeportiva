import { formatText } from '@/utils/formatText';

export default function ProductDescription({ description }) {
    const formattedDescription = formatText(description)

    return (
        <div className="mt-2">
            <div className="collapse collapse-plus bg-base-100 border-base-300 border">
                <input type="checkbox" className="peer" />
                <div className="flex items-center collapse-title font-semibold md:text-base text-sm">
                    Descripción
                </div>
                <div
                    className="collapse-content md:text-base text-sm"
                    dangerouslySetInnerHTML={{ __html: formattedDescription }}
                />
            </div>
        </div>
    )
}