export function getCart() {
  return JSON.parse(
    localStorage.getItem('ocular_cart') || '[]'
  );
}

export function addToCart(product) {
  const cart = getCart();

  const existing = cart.find(
    item => item.id === product.id
  );

  if (existing) {
    existing.quantity =
      (existing.quantity || 1) + 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.images?.[0],
      overlay_url: product.images?.[0],
      brand: product.brand,
      category: product.category,
      quantity: 1,
    });
  }

  localStorage.setItem(
    'ocular_cart',
    JSON.stringify(cart)
  );

  window.dispatchEvent(
    new Event('cartUpdated')
  );

  return cart;
}

export function removeFromCart(productId) {
  let cart = getCart();

  cart = cart.filter(
    item => item.id !== productId
  );

  localStorage.setItem(
    'ocular_cart',
    JSON.stringify(cart)
  );

  window.dispatchEvent(
    new Event('cartUpdated')
  );

  return cart;
}

export function updateQuantity(
  productId,
  quantity
) {
  const cart = getCart();

  const item = cart.find(
    p => p.id === productId
  );

  if (!item) return cart;

  if (quantity <= 0) {
    return removeFromCart(productId);
  }

  item.quantity = quantity;

  localStorage.setItem(
    'ocular_cart',
    JSON.stringify(cart)
  );

  window.dispatchEvent(
    new Event('cartUpdated')
  );

  return cart;
}

export function clearCart() {
  localStorage.setItem(
    'ocular_cart',
    JSON.stringify([])
  );

  window.dispatchEvent(
    new Event('cartUpdated')
  );
}