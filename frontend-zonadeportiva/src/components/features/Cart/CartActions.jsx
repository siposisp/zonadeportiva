import CartQuantitySelector from "./CartQuantitySelector"
import DeleteButton from "@/components/common/buttons/DeleteButton"

export default function CartActions({ item, product, onDelete, onUpdate  }) {
    const handleDelete = () => {
        onDelete(item.product_id);
    }

    return (
        <div className="flex items-center md:gap-4 gap-0">
            <CartQuantitySelector item={item} product={product} onUpdate={onUpdate} />
            <DeleteButton onClick={handleDelete} />
        </div>
    )
}
