class ProductMeta {
  constructor({ id, product_id, sku, price, regular_price, sale_price, sale_start, sale_end, stock, stock_status, visibility, keywords }) {
    this.id = id;
    this.product_id = product_id;
    this.sku = sku;
    this.price = price;
    this.regular_price = regular_price;
    this.sale_price = sale_price;
    this.sale_start = sale_start;
    this.sale_end = sale_end;
    this.stock = stock;
    this.stock_status = stock_status;
    this.visibility = visibility;
    this.keywords = keywords;

  }
}

export default ProductMeta;