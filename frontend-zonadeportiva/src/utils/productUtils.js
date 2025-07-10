export const sortProducts = (products, sort, order) => {
    return [...products].sort((a, b) => {
        if (sort === 'price_asc') return a.price - b.price
        if (sort === 'price_desc') return b.price - a.price
        if (sort === 'name_asc') return a.title.localeCompare(b.title)
        if (sort === 'name_desc') return b.title.localeCompare(a.title)
        return 0
    })
}

export const paginateProducts = (products, page, limit) => {
    const offset = (page - 1) * limit
    const paginated = products.slice(offset, offset + limit)
    const totalPages = Math.ceil(products.length / limit)
    return { paginated, totalPages }
}

export const transformVariants = (variants) => {
    const result = []

    variants?.forEach(variant => {
        const { attribute_id, attribute_name, values } = variant

        values.forEach(value => {

            const valueWithAttribute = { ...value, attribute_id, attribute_name }

            const entryIndex = result.findIndex(entry =>
                entry.product_id === value.product_id
            )

            if (entryIndex !== -1) {
                result[entryIndex].items.push(valueWithAttribute)
            } else {
                result.push({
                    product_id: value.product_id,
                    items: [valueWithAttribute]
                })
            }
        })
    })

    return result
}

export const getFirstAvailableVariant = (product, variants) => {
    for (const variant of variants) {
        for (const item of variant.items) {
            if (item.stock_status === "instock") {
                const productVariant = {
                    product_id: item.product_id,
                    product_name: product.title,
                    metadata: getProductPrice(product),
                    slug: item.slug,
                    stock: item.stock,
                    stock_status: item.stock_status,
                    quantity: item.stock > 0 ? 1 : 0,
                    total: setProductPrice(product)
                }

                const attributes = variant.items.map(i => ({
                    attribute_id: i.attribute_id,
                    attribute_name: i.attribute_name,
                    value_id: i.value_id,
                    value: i.value,
                }))

                return { variant: productVariant, attributes }
            }
        }
    }

    return { variant: null, attributes: [] }
}

export const getSimpleProductSelection = (product) => {
    return {
        product_id: product.id,
        product_name: product.title,
        metadata: getProductPrice(product),
        slug: product.slug,
        stock: product.metadata.stock,
        stock_status: product.metadata.stock_status,
        quantity: product.metadata.stock ? 1 : 0,
        total: setProductPrice(product)
    }
}

export const getProductPrice = (product) => {
    return {
        sale_price: product.metadata.sale_price,
        regular_price: product.metadata.regular_price,
        price: product.metadata.price
    }
}

export const setProductPrice = (product) => {
    return (
        product.metadata.sale_price
        || product.metadata.regular_price
        || product.metadata.price
    )
}

export const findMatchingItemForSubAttribute = (variant, value, currentAttributes) => {
    const mainValueId = currentAttributes.find((attr) => attr.attribute_name === MAIN_ATTRIBUTE)?.value_id

    const currentValueId = value.value_id

    for (const combination of combinations) {
        const hasMain = combination.items.some((item) => item.value_id === mainValueId)
        const hasCurrent = combination.items.some((item) => item.value_id === currentValueId)

        if (hasMain && hasCurrent) {
            const item = combination.items.find((item) =>
                item.value_id === currentValueId &&
                item.attribute_id === variant.attribute_id &&
                item.stock_status === "instock"
            )
            if (item) return item
        }
    }

    return null
}

export const findFirstInStock = (items) => items?.find((item) => item.stock_status === "instock") || null

export const findBestItem = (items) => items?.find((item) => item.stock > 0) || items?.[0] || null

export const getDefaultAttributesForMainVariant = (selectedItem, variant, combinations) => {
    const matchedCombination = combinations.find((combination) => selectedItem.product_id === combination.product_id)

    return (
        matchedCombination?.items
            .filter((item) => item.attribute_name !== variant.attribute_name)
            .map((item) => ({
                attribute_id: item.attribute_id,
                attribute_name: item.attribute_name,
                value_id: item.value_id,
                value_name: item.value,
            })) || []
    )
}

export const buildAttribute = (variant, value) => ({
    attribute_id: variant.attribute_id,
    attribute_name: variant.attribute_name,
    value_id: value.value_id,
    value_name: value.value
})

export const getSelectedItem = (variant, value, prevAttributes, isMultipleAttributes) => {
    if (isMultipleAttributes) {
        if (variant.attribute_name !== MAIN_ATTRIBUTE) {
            return findMatchingItemForSubAttribute(variant, value, prevAttributes)
        }
        const inStock = findFirstInStock(value.items)
        return inStock ? findBestItem(value.items) : null
    }
    return value.items[0]
}

export const getUpdatedAttributes = (variant, value, prevAttributes, shouldReset, defaultAttributes) => {
    const filtered = shouldReset
        ? defaultAttributes
        : (prevAttributes || []).filter(attr => attr.attribute_id !== variant.attribute_id)

    return [...filtered, buildAttribute(variant, value)]
}