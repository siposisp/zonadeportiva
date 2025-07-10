class Product {
  constructor({
    id,
    parent_id,
    title,
    description,
    short_desc,
    status,
    created_at,
    updated_at,
    length,
    width,
    height,
    weight,
    brand_id,
    slug,
    product_type
  }) {
    this.id = id;
    this.parent_id = parent_id;
    this.title = title;
    this.description = description;
    this.short_desc = short_desc;
    this.status = status;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.length = length;
    this.width = width;
    this.height = height;
    this.weight = weight;
    this.brand_id = brand_id;
    this.slug = slug;
    this.product_type = product_type;
  }
}

export default Product;

