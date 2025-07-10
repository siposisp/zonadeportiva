class Category {
  constructor({
    id,
    slug,
    name,
    parent_id
  }) {
    this.id = id;
    this.slug = slug;
    this.name = name;
    this.parent_id = parent_id;
  }
}

export default Category;
  