import React, { useState, useEffect } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  Plus,
  Trash2,
  Loader2,
  Edit2,
  Check,
  X,
  LogOut,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import AdminLogin from '@/components/admin/AdminLogin';


import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
/* ========================= API ========================= */

const getOrders = async () => {
  const res = await fetch('/api/orders.php');
  return res.json();
};

const updateOrderStatus = async ({
  id,
  status,
}) => {
  const res = await fetch('/api/orders.php', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      status,
    }),
  });

  return res.json();
};

const getProducts = async () => {
  const res = await fetch('/api/products.php');
  return res.json();
};

const deleteProduct = async (id) => {
  const res = await fetch(
    `/api/products.php?id=${id}`,
    {
      method: 'DELETE',
    }
  );

  return res.json();
};

const createProduct = async (data) => {
  const res = await fetch('/api/products.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

const updateProduct = async (id, data) => {
  const res = await fetch(
    `/api/products.php?id=${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  return res.json();
};

/* ========================= FORM ========================= */

const defaultForm = () => ({
  name: '',
  brand: '',
  price: '',
  category: '',
  color: '',
  description: '',
  image_url: '',
  overlay_url: '',
  gallery: [],
  images: [],
  in_stock: true,
});

/* ========================= COMPONENT ========================= */

export default function Admin() {

  const queryClient = useQueryClient();

  const [adminLoggedIn, setAdminLoggedIn] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState(defaultForm());

  const [saving, setSaving] =
    useState(false);

  const [expandedId, setExpandedId] =
    useState(null);

  const [showAllOrders, setShowAllOrders] =
    useState(false);

  const [galleryImages, setGalleryImages] =
    useState([]);

  /* ========================= LOGIN ========================= */

  useEffect(() => {
    const saved =
      sessionStorage.getItem(
        'admin_logged_in'
      ) === 'true';

    setAdminLoggedIn(saved);
  }, []);

  /* ========================= QUERIES ========================= */

  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: getProducts,
    enabled: adminLoggedIn === true,
  });

  const ordersQuery = useQuery({
    queryKey: ['admin-orders'],
    queryFn: getOrders,
    enabled: adminLoggedIn === true,
  });

  /* ========================= MUTATIONS ========================= */

const deleteMutation = useMutation({
  mutationFn: async (id) => {
    const res = await fetch(`/api/products.php?id=${id}`, {
      method: 'DELETE',
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Error eliminando producto');
    }

    return data;
  },

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['admin-products'],
    });

    toast.success('Producto eliminado');
  },

  onError: (err) => {
    toast.error(err.message);
  },
});

  const orderStatusMutation = useMutation({
    mutationFn: updateOrderStatus,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-orders'],
      });

      toast.success('Estado actualizado');
    },
  });


  const deleteOrderMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch('/api/orders.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-orders'],
      });

      toast.success('Pedido eliminado');
    },
  });


  /* ========================= LOGIN ========================= */

  if (adminLoggedIn === null) {
    return (
      <div className="p-10">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!adminLoggedIn) {
    return (
      <AdminLogin
        onSuccess={() => {
          sessionStorage.setItem(
            'admin_logged_in',
            'true'
          );

          setAdminLoggedIn(true);
        }}
      />
    );
  }

  /* ========================= SAVE ========================= */

  const handleSave = async () => {

    if (!form.name || !form.price) {
      toast.error(
        'Nombre y precio obligatorios'
      );

      return;
    }

    setSaving(true);

    try {

      const data = {
        ...form,
        price: parseFloat(form.price),
      };

      if (editingId) {

        await updateProduct(
          editingId,
          data
        );

        toast.success(
          'Producto actualizado'
        );

      } else {

        await createProduct(data);

        toast.success(
          'Producto creado'
        );
      }

      queryClient.invalidateQueries({
        queryKey: ['admin-products'],
      });

      setForm(defaultForm());

      setShowForm(false);

      setEditingId(null);

    } finally {

      setSaving(false);
    }
  };

  /* ========================= EDIT ========================= */

  const startEdit = (p) => {

    setForm({
      name: p.name || '',
      brand: p.brand || '',
      price: p.price?.toString() || '',
      category: p.category || 'optical',
      color: p.color || '',
      description: p.description || '',
      image_url: p.image_url || '',
      overlay_url: p.overlay_url || '',
      gallery: p.gallery || [],
      images: p.images || p.gallery || [],
      in_stock: p.in_stock !== false,
    });

    setGalleryImages(p.gallery || []);

    setEditingId(p.id);

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const cancelForm = () => {

    setGalleryImages([]);

    setShowForm(false);

    setEditingId(null);

    setForm(defaultForm());
  };

  /* ========================= DATA ========================= */

  const products =
    productsQuery.data ?? [];

  const orders = [...(ordersQuery.data ?? [])].reverse();

  const visibleOrders =
    showAllOrders
      ? orders
      : orders.slice(0, 4);

  const isLoading =
    productsQuery.isLoading;

  /* ========================= Guardar imagen ========================= */
  const handleGalleryUpload = async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;

    const uploaded = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload.php', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        uploaded.push(data.url);
      }
    }

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...uploaded],
    }));
  };

  const handleOverlayUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload.php', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setForm((prev) => ({
          ...prev,
          overlay_url: data.url,
        }));

        toast.success('Overlay subido');
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Error al subir overlay');
    }
  };

  // guardar multiples imagenes catalogo



  const handleDeleteImage = async (img, index) => {
    try {
      await fetch('/api/delete-file.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: img }),
      });

      setForm((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));

      toast.success('Imagen eliminada');
    } catch (err) {
      toast.error('Error eliminando imagen');
    }
  };

  const handleDeleteOverlay = async () => {
    if (!form.overlay_url) return;

    try {
      await fetch('/api/delete-file.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: form.overlay_url }),
      });

      setForm((prev) => ({
        ...prev,
        overlay_url: '',
      }));

      toast.success('Overlay eliminado');
    } catch (err) {
      toast.error('Error eliminando overlay');
    }
  };

  //carrusel/////////////

  const ProductCardCarousel = ({ images = [] }) => {
    const [index, setIndex] = React.useState(0);

    if (!images.length) {
      return (
        <div className="w-full h-40 flex items-center justify-center border rounded">
          Sin imagen
        </div>
      );
    }

    const next = (e) => {
      e.stopPropagation();
      setIndex((prev) => (prev + 1) % images.length);
    };

    const prev = (e) => {
      e.stopPropagation();
      setIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    };

    return (
      <div className="relative w-full h-40">
        <img
          src={images[index]}
          className="w-full h-40 object-contain rounded"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 text-white w-6 h-6 rounded"
            >
              ‹
            </button>

            <button
              onClick={next}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 text-white w-6 h-6 rounded"
            >
              ›
            </button>

            <div className="absolute bottom-1 right-1 text-xs bg-black/50 text-white px-2 rounded">
              {index + 1}/{images.length}
            </div>
          </>
        )}
      </div>
    );
  };


  return (

    <div className="pt-20 min-h-screen">

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* HEADER */}

        <div className="flex justify-between mb-8">

          <h1 className="text-3xl font-bold">
            Admin Óptica
          </h1>

          <Button
            variant="outline"
            onClick={() => {

              sessionStorage.removeItem(
                'admin_logged_in'
              );

              setAdminLoggedIn(false);
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>

        {/* NEW PRODUCT */}

        <Button
          className="mb-6"
          onClick={() =>
            setShowForm(true)
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo producto
        </Button>

        {/* FORM */}

        {showForm && (

          <div className="border rounded-xl p-6 mb-6">

            <h2 className="font-semibold mb-4">

              {editingId
                ? 'Editar'
                : 'Nuevo'} producto

            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              <Input
                placeholder="Nombre"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name:
                      e.target.value,
                  })
                }
              />

              <Input
                placeholder="Marca"
                value={form.brand}
                onChange={(e) =>
                  setForm({
                    ...form,
                    brand:
                      e.target.value,
                  })
                }
              />

              <Input
                placeholder="Precio"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price:
                      e.target.value,
                  })
                }
              />

              <Input
                placeholder="Color"
                value={form.color}
                onChange={(e) =>
                  setForm({
                    ...form,
                    color:
                      e.target.value,
                  })
                }
              />

<select
  value={form.category}
  onChange={(e) =>
    setForm({
      ...form,
      category: e.target.value,
    })
  }
  className="w-full h-10 px-3 border rounded-md bg-background"
>
  <option value="">Seleccionar categoría</option>
  <option value="optical">Óptico</option>
  <option value="sunglasses">Sol</option>
  <option value="blue_light">Luz Azul</option>
  <option value="reading">Lectura</option>
</select>

              <Input
                placeholder="Descripción"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description:
                      e.target.value,
                  })
                }
              />

              {/* IMAGES */}
              <div className="mt-4 space-y-2">
                <label>Imágenes</label>

                <Input type="file" multiple onChange={handleGalleryUpload} />

                <div className="flex gap-2 flex-wrap mt-3">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={img}
                        className="w-16 h-16 object-cover rounded border"
                      />

                      {/* ❌ DELETE BUTTON */}
                      <button
                        onClick={() => handleDeleteImage(img, i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs hidden group-hover:flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>


              <div className="space-y-2">

                <label className="text-sm font-medium">
                  Overlay para prueba virtual
                </label>

                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleOverlayUpload}
                />

                {form.overlay_url && (
                  <div className="relative inline-block group">
                    <img
                      src={form.overlay_url}
                      alt="Overlay Preview"
                      className="w-40 h-40 object-contain border rounded-lg p-2"
                    />

                    <button
                      type="button"
                      onClick={handleDeleteOverlay}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs hidden group-hover:flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}

              </div>

              {/* GALERÍA DEL CATÁLOGO */}

              {/* <div className="space-y-2">

  <label className="text-sm font-medium">
    Imágenes del catálogo
  </label>

  <Input
    type="file"
    multiple
    accept="image/*"
    onChange={handleGalleryUpload}
  />

  <div className="flex flex-wrap gap-2 mt-3">

    {galleryImages.map((img, i) => (
      <div key={i} className="relative">

        <img
          src={img}
          className="w-20 h-20 object-cover rounded border"
        />

        <button
          type="button"
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5"
          onClick={() => {
            const updated = galleryImages.filter(
              (_, idx) => idx !== i
            );

            setGalleryImages(updated);

            setForm(prev => ({
              ...prev,
              gallery: updated
            }));
          }}
        >
          ×
        </button>

      </div>
    ))}

  </div>

</div> */}

            </div>

            <div className="flex items-center gap-2 mt-3">

              <input
                type="checkbox"
                checked={form.in_stock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    in_stock:
                      e.target.checked,
                  })
                }
              />

              <span>
                En stock
              </span>
            </div>

            <div className="flex gap-2 mt-4">

              <Button
                onClick={handleSave}
                disabled={saving}
              >

                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check />
                )}

                Guardar

              </Button>

              <Button
                variant="ghost"
                onClick={cancelForm}
              >
                <X />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* ORDERS */}

        {/* ORDERS */}

        <div className="mb-10">

          <div className="border rounded-2xl p-5">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>

                <h2 className="text-2xl font-bold">
                  🧾 Pedidos
                </h2>

                <p className="text-muted-foreground text-sm mt-1">
                  {orders.length} pedidos registrados
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  setShowAllOrders(!showAllOrders)
                }
              >
                {showAllOrders
                  ? 'Ocultar pedidos'
                  : 'Mostrar pedidos'}
              </Button>
            </div>

            {showAllOrders && (

              <div className="space-y-4 mt-6">

                {orders.length === 0 ? (

                  <div className="border rounded-xl p-6 text-center text-muted-foreground">
                    No hay pedidos
                  </div>

                ) : (

                  orders.map((o) => {

                    const isOpen =
                      expandedId === o.id;

                    return (

                      <div
                        key={o.id}
                        className="border p-4 rounded-2xl transition"
                      >

                        {/* HEADER */}

                        <div
                          className="cursor-pointer"
                          onClick={() =>
                            setExpandedId(
                              expandedId === o.id
                                ? null
                                : o.id
                            )
                          }
                        >

                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                            <div>

                              <p className="font-bold text-lg">
                                {o.customer?.name ||
                                  'Sin nombre'}
                              </p>

                              <p className="text-sm text-muted-foreground">
                                {o.customer?.email ||
                                  'Sin email'}
                              </p>


                            </div>

                            <div className="flex flex-wrap gap-2 items-center">

                              <button
                                onClick={(e) => {

                                  e.stopPropagation();

                                  orderStatusMutation.mutate({
                                    id: o.id,
                                    status: 'Pendiente',
                                  });
                                }}
                                className={`px-3 py-2 rounded-xl text-sm text-white ${o.status === 'Pendiente'
                                  ? 'bg-yellow-500 ring-2 ring-offset-2 ring-yellow-300'
                                  : 'bg-yellow-500/40'
                                  }`}
                              >
                                Pendiente
                              </button>

                              <button
                                onClick={(e) => {

                                  e.stopPropagation();

                                  orderStatusMutation.mutate({
                                    id: o.id,
                                    status: 'En proceso',
                                  });
                                }}
                                className={`px-3 py-2 rounded-xl text-sm text-white ${o.status === 'En proceso'
                                  ? 'bg-blue-500 ring-2 ring-offset-2 ring-blue-300'
                                  : 'bg-blue-500/40'
                                  }`}
                              >
                                En proceso
                              </button>

                              <button
                                onClick={(e) => {

                                  e.stopPropagation();

                                  orderStatusMutation.mutate({
                                    id: o.id,
                                    status: 'Terminados',
                                  });
                                }}
                                className={`px-3 py-2 rounded-xl text-sm text-white ${o.status === 'Terminados'
                                  ? 'bg-green-500 ring-2 ring-offset-2 ring-green-300'
                                  : 'bg-green-500/40'
                                  }`}
                              >
                                Terminados
                              </button>

                              <button
                                onClick={(e) => {

                                  e.stopPropagation();

                                  orderStatusMutation.mutate({
                                    id: o.id,
                                    status: 'Entregados',
                                  });
                                }}
                                className={`px-3 py-2 rounded-xl text-sm text-white ${o.status === 'Entregados'
                                  ? 'bg-purple-500 ring-2 ring-offset-2 ring-purple-300'
                                  : 'bg-purple-500/40'
                                  }`}
                              >
                                Entregados
                              </button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-10 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </AlertDialogTrigger>

                                <AlertDialogContent
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      ¿Eliminar pedido?
                                    </AlertDialogTitle>

                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancelar
                                    </AlertDialogCancel>

                                    <AlertDialogAction
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteOrderMutation.mutate(o.id);
                                      }}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>


                            </div>
                          </div>

                          <div className="mt-2">

                            <span className="font-semibold">
                              ${o.total || 0}
                            </span>

                          </div>
                        </div>

                        {/* EXPAND */}

                        {isOpen && (

                          <div className="mt-5 border-t pt-4 space-y-4">

                            <div>

                              <p className="font-medium mb-2">
                                Productos
                              </p>

                              <div className="space-y-2">

                                {o.items?.map(
                                  (item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between text-sm border-b pb-2"
                                    >

                                      <span>
                                        {item.name}
                                      </span>

                                      <span className="font-medium">
                                        ${item.price}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            {o.prescriptionUrl && (

                              <div>

                                <p className="font-medium mb-2">
                                  Receta
                                </p>

                                <img
                                  src={o.prescriptionUrl}
                                  className="w-40 rounded-xl border cursor-pointer hover:opacity-90"
                                  onClick={() =>
                                    window.open(
                                      o.prescriptionUrl,
                                      '_blank'
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* PRODUCTS */}

        {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <div key={p.id} className="border p-3 rounded-xl">
                <ProductCardCarousel images={p.images} />

                <p className="font-semibold">{p.name}</p>
                <p>${p.price}</p>

                <div className="flex justify-end gap-2">
                  <button onClick={() => startEdit(p)}>
                    <Edit2 />
                  </button>

                  <button onClick={() => deleteMutation.mutate(p.id)}>
                    <Trash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}