export function getCart() {
  return JSON.parse(localStorage.getItem('ocular_cart') || '[]');
}

export function addToCart(product) {
  const cart = getCart();
  const exists = cart.find(item => item.id === product.id);
  if (!exists) {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.images[0],
      overlay_url: product.images[0], // 👈 AGREGAR ESTO
      brand: product.brand,
      category: product.category,
    });

    localStorage.setItem('ocular_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  }

  return cart;
}

export function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('ocular_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
  return cart;
}

export function clearCart() {
  localStorage.setItem('ocular_cart', JSON.stringify([]));
  window.dispatchEvent(new Event('cartUpdated'));
}