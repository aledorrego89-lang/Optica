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


/* =========================================================
   API
========================================================= */

const getOrders = async () => {
  const res = await fetch('/api/orders.php');

  if (!res.ok) {
    throw new Error('Error obteniendo pedidos');
  }

  return res.json();
};


const updateOrderStatus = async ({ id, status }) => {
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

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error actualizando estado');
  }

  return data;
};


const getProducts = async () => {
  const res = await fetch('/api/products.php');

  if (!res.ok) {
    throw new Error('Error obteniendo productos');
  }

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

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || 'Error creando producto');
  }

  return result;
};


const updateProduct = async (id, data) => {
  const res = await fetch(`/api/products.php?id=${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || 'Error actualizando producto');
  }

  return result;
};


/* =========================================================
   FORMULARIO
========================================================= */

const defaultForm = () => ({
  name: '',
  brand: '',
  model: '',
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


const formatDateAR = (dateString) => {
  if (!dateString) {
    return 'Sin fecha';
  }

  try {
    return new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateString));
  } catch {
    return 'Fecha inválida';
  }
};


/* =========================================================
   CARRUSEL DE PRODUCTOS
========================================================= */

const ProductCardCarousel = ({ images = [] }) => {
  const [index, setIndex] = useState(0);

  if (!images || !images.length) {
    return (
      <div className="w-full h-40 flex items-center justify-center border rounded">
        Sin imagen
      </div>
    );
  }

  const next = (e) => {
    e.stopPropagation();

    setIndex((prev) => (
      (prev + 1) % images.length
    ));
  };

  const prev = (e) => {
    e.stopPropagation();

    setIndex((prev) => (
      prev === 0
        ? images.length - 1
        : prev - 1
    ));
  };

  return (
    <div className="relative w-full h-40">

      <img
        src={images[index]}
        className="w-full h-40 object-contain rounded"
        alt="Producto"
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 text-white w-7 h-7 rounded-full"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={next}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 text-white w-7 h-7 rounded-full"
          >
            ›
          </button>

          <div className="absolute bottom-1 right-1 text-xs bg-black/50 text-white px-2 py-1 rounded">
            {index + 1}/{images.length}
          </div>
        </>
      )}

    </div>
  );
};


/* =========================================================
   COMPONENTE ADMIN
========================================================= */

export default function Admin() {

  const queryClient = useQueryClient();


  /* =======================================================
     ESTADOS
  ======================================================= */

  const [adminLoggedIn, setAdminLoggedIn] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(defaultForm());

  const [saving, setSaving] = useState(false);

  const [expandedId, setExpandedId] = useState(null);

  const [showAllOrders, setShowAllOrders] = useState(false);

  const [orderSearch, setOrderSearch] = useState('');

  const [orderStatusFilter, setOrderStatusFilter] = useState('all');


  /* =======================================================
     LOGIN
  ======================================================= */

  useEffect(() => {

    const saved =
      sessionStorage.getItem('admin_logged_in') === 'true';

    setAdminLoggedIn(saved);

  }, []);


  /* =======================================================
     PRODUCTOS
  ======================================================= */

  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: getProducts,
    enabled: adminLoggedIn === true,
  });


  /* =======================================================
     PEDIDOS
  ======================================================= */

  const ordersQuery = useQuery({
    queryKey: ['admin-orders'],
    queryFn: getOrders,
    enabled: adminLoggedIn === true,

    refetchInterval: 5000,

    refetchOnWindowFocus: true,
  });


  /* =======================================================
     ELIMINAR PRODUCTO
  ======================================================= */

  const deleteMutation = useMutation({

    mutationFn: async (id) => {

      const res = await fetch(
        `/api/products.php?id=${id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(
          data.error || 'Error eliminando producto'
        );
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


  /* =======================================================
     CAMBIAR ESTADO PEDIDO
  ======================================================= */

  const orderStatusMutation = useMutation({

    mutationFn: updateOrderStatus,

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ['admin-orders'],
      });

      toast.success('Estado actualizado');
    },

    onError: (err) => {
      toast.error(err.message);
    },

  });


  /* =======================================================
     ELIMINAR PEDIDO
  ======================================================= */

  const deleteOrderMutation = useMutation({

    mutationFn: async (id) => {

      const res = await fetch('/api/orders.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || 'Error eliminando pedido'
        );
      }

      return data;
    },

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ['admin-orders'],
      });

      toast.success('Pedido eliminado');

      setExpandedId(null);
    },

    onError: (err) => {
      toast.error(err.message);
    },

  });


  /* =======================================================
     CARGANDO LOGIN
  ======================================================= */

  if (adminLoggedIn === null) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }


  /* =======================================================
     LOGIN ADMIN
  ======================================================= */

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


  /* =======================================================
     GUARDAR PRODUCTO
  ======================================================= */

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

    } catch (error) {

      toast.error(
        error.message || 'Error guardando producto'
      );

    } finally {

      setSaving(false);

    }
  };


  /* =======================================================
     EDITAR PRODUCTO
  ======================================================= */

  const startEdit = (p) => {

    setForm({

      name: p.name || '',

      brand: p.brand || '',

      model: p.model || '',

      price: p.price?.toString() || '',

      category: p.category || 'optical',

      color: p.color || '',

      description: p.description || '',

      image_url: p.image_url || '',

      overlay_url: p.overlay_url || '',

      gallery: p.gallery || [],

      images:
        p.images ||
        p.gallery ||
        [],

      in_stock:
        p.in_stock !== false,

    });


    setEditingId(p.id);

    setShowForm(true);


    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

  };


  /* =======================================================
     CANCELAR FORMULARIO
  ======================================================= */

  const cancelForm = () => {

    setShowForm(false);

    setEditingId(null);

    setForm(defaultForm());

  };


  /* =======================================================
     SUBIR GALERÍA
  ======================================================= */

  const handleGalleryUpload = async (e) => {

    const files = [
      ...e.target.files
    ];

    if (!files.length) {
      return;
    }


    const uploaded = [];


    try {

      for (const file of files) {

        const formData =
          new FormData();

        formData.append(
          'image',
          file
        );


        const res = await fetch(
          '/api/upload.php',
          {
            method: 'POST',
            body: formData,
          }
        );


        const data =
          await res.json();


        if (data.success) {

          uploaded.push(
            data.url
          );

        } else {

          toast.error(
            data.error ||
            'Error subiendo imagen'
          );
        }
      }


      if (uploaded.length) {

        setForm((prev) => ({
          ...prev,

          images: [
            ...prev.images,
            ...uploaded,
          ],
        }));

        toast.success(
          `${uploaded.length} imagen(es) subida(s)`
        );
      }

    } catch {

      toast.error(
        'Error al subir imágenes'
      );

    }

  };


  /* =======================================================
     SUBIR OVERLAY
  ======================================================= */

  const handleOverlayUpload = async (e) => {

    const file =
      e.target.files[0];

    if (!file) {
      return;
    }


    const formData =
      new FormData();

    formData.append(
      'image',
      file
    );


    try {

      const res = await fetch(
        '/api/upload.php',
        {
          method: 'POST',
          body: formData,
        }
      );


      const data =
        await res.json();


      if (data.success) {

        setForm((prev) => ({
          ...prev,
          overlay_url:
            data.url,
        }));

        toast.success(
          'Overlay subido'
        );

      } else {

        toast.error(
          data.error ||
          'Error subiendo overlay'
        );
      }

    } catch {

      toast.error(
        'Error al subir overlay'
      );
    }

  };


  /* =======================================================
     ELIMINAR IMAGEN
  ======================================================= */

  const handleDeleteImage = async (
    img,
    index
  ) => {

    try {

      const res = await fetch(
        '/api/delete-file.php',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            path: img,
          }),
        }
      );


      if (!res.ok) {
        throw new Error(
          'Error eliminando imagen'
        );
      }


      setForm((prev) => ({

        ...prev,

        images:
          prev.images.filter(
            (_, i) =>
              i !== index
          ),

      }));


      toast.success(
        'Imagen eliminada'
      );

    } catch {

      toast.error(
        'Error eliminando imagen'
      );

    }

  };


  /* =======================================================
     ELIMINAR OVERLAY
  ======================================================= */

  const handleDeleteOverlay = async () => {

    if (!form.overlay_url) {
      return;
    }


    try {

      const res = await fetch(
        '/api/delete-file.php',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            path:
              form.overlay_url,
          }),
        }
      );


      if (!res.ok) {
        throw new Error();
      }


      setForm((prev) => ({
        ...prev,
        overlay_url: '',
      }));


      toast.success(
        'Overlay eliminado'
      );

    } catch {

      toast.error(
        'Error eliminando overlay'
      );

    }

  };


  /* =======================================================
     DATOS
  ======================================================= */

  const products =
    productsQuery.data ?? [];

  const orders =
    ordersQuery.data ?? [];


  /* =======================================================
     CONTADORES
  ======================================================= */

  const statusCounts =
    orders.reduce(
      (acc, o) => {

        const status =
          o.status;

        acc.all += 1;


        if (
          status ===
          'Pendiente'
        ) {
          acc.Pendiente += 1;
        }


        if (
          status ===
          'En proceso'
        ) {
          acc['En proceso'] += 1;
        }


        if (
          status ===
          'Terminados'
        ) {
          acc.Terminados += 1;
        }


        if (
          status ===
          'Entregados'
        ) {
          acc.Entregados += 1;
        }


        return acc;

      },
      {
        all: 0,
        Pendiente: 0,
        'En proceso': 0,
        Terminados: 0,
        Entregados: 0,
      }
    );


  /* =======================================================
     FILTRAR PEDIDOS
  ======================================================= */

  const filteredOrders =
    orders.filter((o) => {

      const q =
        orderSearch
          .toLowerCase()
          .trim();


      const customerName =
        o.customer?.name ||
        o.customer_name ||
        '';


      const customerEmail =
        o.customer?.email ||
        o.customer_email ||
        '';


      const customerPhone =
        o.customer?.phone ||
        o.customer_phone ||
        '';


      const matchesSearch =

        customerName
          .toLowerCase()
          .includes(q)

        ||

        customerEmail
          .toLowerCase()
          .includes(q)

        ||

        customerPhone
          .toLowerCase()
          .includes(q)

        ||

        String(o.id)
          .toLowerCase()
          .includes(q)

        ||

        String(o.status)
          .toLowerCase()
          .includes(q);


      const matchesStatus =

        orderStatusFilter ===
          'all'

          ||

        o.status ===
          orderStatusFilter;


      return (
        matchesSearch &&
        matchesStatus
      );

    });


  const visibleOrders =
    showAllOrders
      ? filteredOrders
      : filteredOrders.slice(0, 4);


  const isLoading =
    productsQuery.isLoading;


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div className="pt-20 min-h-screen">

      <div className="max-w-6xl mx-auto px-6 py-12">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex justify-between items-center mb-8">

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


        {/* =================================================
            NUEVO PRODUCTO
        ================================================= */}

        <Button
          className="mb-6"
          onClick={() => {

            setEditingId(null);

            setForm(
              defaultForm()
            );

            setShowForm(true);

          }}
        >

          <Plus className="w-4 h-4 mr-2" />

          Nuevo producto

        </Button>


        {/* =================================================
            FORMULARIO PRODUCTO
        ================================================= */}

        {showForm && (

          <div className="border rounded-xl p-6 mb-8">

            <h2 className="font-semibold mb-5">

              {editingId
                ? 'Editar producto'
                : 'Nuevo producto'}

            </h2>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


              {/* NOMBRE */}

              <div className="space-y-1">

                <label className="text-sm font-medium">
                  Nombre
                </label>

                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name:
                        e.target.value,
                    })
                  }
                />

              </div>


              {/* MARCA */}

              <div className="space-y-1">

                <label className="text-sm font-medium">
                  Marca
                </label>

                <Input
                  value={form.brand}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      brand:
                        e.target.value,
                    })
                  }
                />

              </div>


              {/* MODELO */}

              <div className="space-y-1">

                <label className="text-sm font-medium">
                  Modelo
                </label>

                <Input
                  value={form.model}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      model:
                        e.target.value,
                    })
                  }
                />

              </div>


              {/* PRECIO */}

              <div className="space-y-1">

                <label className="text-sm font-medium">
                  Precio
                </label>

                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price:
                        e.target.value,
                    })
                  }
                />

              </div>


              {/* COLOR */}

              <div className="space-y-1">

                <label className="text-sm font-medium">
                  Color
                </label>

                <Input
                  value={form.color}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      color:
                        e.target.value,
                    })
                  }
                />

              </div>


              {/* DESCRIPCIÓN */}

              <div className="space-y-1">

                <label className="text-sm font-medium">
                  Descripción / Medidas
                </label>

                <Input
                  value={
                    form.description
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    })
                  }
                />

              </div>


              {/* CATEGORÍA */}

              <div className="md:col-span-2">

                <label className="block text-sm font-medium mb-2">
                  Categoría
                </label>

                <select
                  value={
                    form.category
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category:
                        e.target.value,
                    })
                  }
                  className="w-full h-10 px-3 border rounded-md bg-background"
                >

                  <option value="">
                    Seleccionar categoría
                  </option>

                  <option value="optical">
                    Óptico
                  </option>

                  <option value="sunglasses">
                    Sol
                  </option>

                  <option value="blue_light">
                    Luz Azul
                  </option>

                  <option value="reading">
                    Lectura
                  </option>

                </select>

              </div>


              {/* =================================================
                  IMÁGENES + OVERLAY
              ================================================= */}

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">


                {/* GALERÍA */}

                <div className="space-y-3">

                  <label className="block text-sm font-medium">
                    Imágenes del catálogo
                  </label>


                  <Input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    onChange={
                      handleGalleryUpload
                    }
                  />


                  <div className="flex flex-wrap gap-3 mt-3">

                    {form.images.map(
                      (img, i) => (

                        <div
                          key={i}
                          className="relative group"
                        >

                          <img
                            src={img}
                            className="w-16 h-16 object-cover rounded-lg border"
                            alt="Galería"
                          />


                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteImage(
                                img,
                                i
                              )
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs hidden group-hover:flex items-center justify-center"
                          >
                            ×
                          </button>

                        </div>

                      )
                    )}

                  </div>

                </div>


                {/* OVERLAY */}

                <div className="space-y-3">

                  <label className="block text-sm font-medium">
                    Overlay para prueba virtual
                  </label>


                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={
                      handleOverlayUpload
                    }
                  />


                  {form.overlay_url && (

                    <div className="relative inline-block group mt-3">

                      <img
                        src={
                          form.overlay_url
                        }
                        alt="Overlay Preview"
                        className="w-40 h-40 object-contain border rounded-lg p-2 bg-white"
                      />


                      <button
                        type="button"
                        onClick={
                          handleDeleteOverlay
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs hidden group-hover:flex items-center justify-center"
                      >
                        ×
                      </button>

                    </div>

                  )}

                </div>

              </div>

            </div>


            {/* STOCK */}

            <div className="flex items-center gap-2 mt-5">

              <input
                type="checkbox"
                checked={
                  form.in_stock
                }
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


            {/* BOTONES */}

            <div className="flex gap-2 mt-5">

              <Button
                onClick={
                  handleSave
                }
                disabled={saving}
              >

                {saving ? (

                  <Loader2
                    className="w-4 h-4 mr-2 animate-spin"
                  />

                ) : (

                  <Check className="w-4 h-4 mr-2" />

                )}

                Guardar

              </Button>


              <Button
                variant="ghost"
                onClick={
                  cancelForm
                }
              >

                <X className="w-4 h-4 mr-2" />

                Cancelar

              </Button>

            </div>

          </div>

        )}


        {/* =================================================
            PEDIDOS
        ================================================= */}

        <div className="mb-10">

          <div className="border rounded-2xl p-5">


            {/* CABECERA PEDIDOS */}

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
                  setShowAllOrders(
                    !showAllOrders
                  )
                }
              >

                {showAllOrders
                  ? 'Ocultar pedidos'
                  : 'Mostrar pedidos'}

              </Button>

            </div>


            {/* CONTENIDO */}

            {showAllOrders && (

              <div className="space-y-4 mt-6">


                {/* BÚSQUEDA Y FILTROS */}

                <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">


                  <Input
                    placeholder="Buscar por nombre, email, teléfono, estado o ID..."
                    value={
                      orderSearch
                    }
                    onChange={(e) =>
                      setOrderSearch(
                        e.target.value
                      )
                    }
                    className="max-w-md"
                  />


                  <div className="flex flex-wrap gap-1.5">


                    {/* TODOS */}

                    <button
                      type="button"
                      onClick={() =>
                        setOrderStatusFilter(
                          'all'
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs border transition ${
                        orderStatusFilter ===
                        'all'
                          ? 'bg-black text-white'
                          : 'bg-transparent hover:bg-gray-100'
                      }`}
                    >

                      Todos (
                      {
                        statusCounts.all
                      }
                      )

                    </button>


                    {/* PENDIENTES */}

                    <button
                      type="button"
                      onClick={() =>
                        setOrderStatusFilter(
                          'Pendiente'
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs transition ${
                        orderStatusFilter ===
                        'Pendiente'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-yellow-500/20 hover:bg-yellow-500/30'
                      }`}
                    >

                      Pendientes (
                      {
                        statusCounts.Pendiente
                      }
                      )

                    </button>


                    {/* EN PROCESO */}

                    <button
                      type="button"
                      onClick={() =>
                        setOrderStatusFilter(
                          'En proceso'
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs transition ${
                        orderStatusFilter ===
                        'En proceso'
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-500/20 hover:bg-blue-500/30'
                      }`}
                    >

                      En proceso (
                      {
                        statusCounts[
                          'En proceso'
                        ]
                      }
                      )

                    </button>


                    {/* TERMINADOS */}

                    <button
                      type="button"
                      onClick={() =>
                        setOrderStatusFilter(
                          'Terminados'
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs transition ${
                        orderStatusFilter ===
                        'Terminados'
                          ? 'bg-green-500 text-white'
                          : 'bg-green-500/20 hover:bg-green-500/30'
                      }`}
                    >

                      Terminados (
                      {
                        statusCounts.Terminados
                      }
                      )

                    </button>


                    {/* ENTREGADOS */}

                    <button
                      type="button"
                      onClick={() =>
                        setOrderStatusFilter(
                          'Entregados'
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs transition ${
                        orderStatusFilter ===
                        'Entregados'
                          ? 'bg-purple-500 text-white'
                          : 'bg-purple-500/20 hover:bg-purple-500/30'
                      }`}
                    >

                      Entregados (
                      {
                        statusCounts.Entregados
                      }
                      )

                    </button>

                  </div>

                </div>


                {/* SIN PEDIDOS */}

                {orders.length === 0 ? (

                  <div className="border rounded-xl p-6 text-center text-muted-foreground">
                    No hay pedidos
                  </div>

                ) : visibleOrders.length === 0 ? (

                  <div className="border rounded-xl p-6 text-center text-muted-foreground">
                    No se encontraron pedidos con esos filtros.
                  </div>

                ) : (

                  /* =================================================
                     LISTA PEDIDOS
                  ================================================= */

                  visibleOrders.map((o) => {

                    const isOpen =
                      expandedId ===
                      o.id;


                    const orderTotal =
                      (
                        o.items ||
                        []
                      ).reduce(
                        (
                          total,
                          item
                        ) =>
                          total +
                          Number(
                            item.price ||
                              0
                          ) *
                          Number(
                            item.qty ||
                              0
                          ),
                        0
                      );


                    const customerName =
                      o.customer?.name ||
                      o.customer_name ||
                      'Sin nombre';


                    const customerEmail =
                      o.customer?.email ||
                      o.customer_email ||
                      '';


                    const customerPhone =
                      o.customer?.phone ||
                      o.customer_phone ||
                      '';


                    return (

                      <div
                        key={o.id}
                        className={`border p-4 rounded-2xl transition ${
                          isOpen
                            ? 'bg-black/5 border-black/20'
                            : 'bg-white'
                        }`}
                      >


                        {/* =================================================
                            CABECERA PEDIDO
                        ================================================= */}

                        <div
                          className="cursor-pointer"
                          onClick={() =>
                            setExpandedId(
                              expandedId ===
                                o.id
                                ? null
                                : o.id
                            )
                          }
                        >

                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">


                            {/* CLIENTE */}

                            <div className="space-y-1 min-w-0">

                              <div className="font-semibold text-lg">
                                {customerName}
                              </div>


                              {customerEmail && (

                                <div className="text-sm text-muted-foreground">
                                  ✉️{' '}
                                  {customerEmail}
                                </div>

                              )}


                              {customerPhone ? (

                                <a
                                  href={`https://wa.me/${String(
                                    customerPhone
                                  ).replace(
                                    /\D/g,
                                    ''
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 underline text-sm inline-block"
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >

                                  📱{' '}
                                  {
                                    customerPhone
                                  }

                                </a>

                              ) : (

                                <div className="text-sm text-muted-foreground">
                                  📱 Sin teléfono
                                </div>

                              )}


                              {/* COMPROBANTE */}

                              {o.transfer_proof && (

                                <div>

                                  <a
                                    href={
                                      o.transfer_proof
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline text-sm"
                                    onClick={(e) =>
                                      e.stopPropagation()
                                    }
                                  >

                                    📄 Comprobante de pago

                                  </a>

                                </div>

                              )}

                            </div>


                            {/* ESTADOS */}

                            <div className="flex flex-wrap gap-2 items-center">


                              {/* PENDIENTE */}

                              <button
                                type="button"
                                onClick={(e) => {

                                  e.stopPropagation();

                                  orderStatusMutation.mutate(
                                    {
                                      id: o.id,
                                      status:
                                        'Pendiente',
                                    }
                                  );

                                }}
                                className={`px-3 py-2 rounded-xl text-sm text-white ${
                                  o.status ===
                                  'Pendiente'
                                    ? 'bg-yellow-500 ring-2 ring-offset-2 ring-yellow-300'
                                    : 'bg-yellow-500/40'
                                }`}
                              >

                                Pendiente

                              </button>


                              {/* EN PROCESO */}

                              <button
                                type="button"
                                onClick={(e) => {

                                  e.stopPropagation();

                                  orderStatusMutation.mutate(
                                    {
                                      id: o.id,
                                      status:
                                        'En proceso',
                                    }
                                  );

                                }}
                                className={`px-3 py-2 rounded-xl text-sm text-white ${
                                  o.status ===
                                  'En proceso'
                                    ? 'bg-blue-500 ring-2 ring-offset-2 ring-blue-300'
                                    : 'bg-blue-500/40'
                                }`}
                              >

                                En proceso

                              </button>


                              {/* TERMINADOS */}

                              <button
                                type="button"
                                onClick={(e) => {

                                  e.stopPropagation();

                                  orderStatusMutation.mutate(
                                    {
                                      id: o.id,
                                      status:
                                        'Terminados',
                                    }
                                  );

                                }}
                                className={`px-3 py-2 rounded-xl text-sm text-white ${
                                  o.status ===
                                  'Terminados'
                                    ? 'bg-green-500 ring-2 ring-offset-2 ring-green-300'
                                    : 'bg-green-500/40'
                                }`}
                              >

                                Terminados

                              </button>


                              {/* ENTREGADOS */}

                              <button
                                type="button"
                                onClick={(e) => {

                                  e.stopPropagation();

                                  orderStatusMutation.mutate(
                                    {
                                      id: o.id,
                                      status:
                                        'Entregados',
                                    }
                                  );

                                }}
                                className={`px-3 py-2 rounded-xl text-sm text-white ${
                                  o.status ===
                                  'Entregados'
                                    ? 'bg-purple-500 ring-2 ring-offset-2 ring-purple-300'
                                    : 'bg-purple-500/40'
                                }`}
                              >

                                Entregados

                              </button>


                              {/* ELIMINAR */}

                              <AlertDialog>

                                <AlertDialogTrigger
                                  asChild
                                >

                                  <button
                                    type="button"
                                    onClick={(e) =>
                                      e.stopPropagation()
                                    }
                                    className="w-10 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                                  >

                                    <Trash2 className="w-4 h-4" />

                                  </button>

                                </AlertDialogTrigger>


                                <AlertDialogContent
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
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

                                        deleteOrderMutation.mutate(
                                          o.id
                                        );

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


                          {/* INFORMACIÓN PEDIDO */}

                          <div className="mt-3 flex flex-wrap gap-4 text-sm">

                            <span className="font-semibold">

                              Total: $
                              {orderTotal.toLocaleString(
                                'es-AR'
                              )}

                            </span>


                            <span className="text-muted-foreground">

                              🕒{' '}
                              {formatDateAR(
                                o.created_at
                              )}

                            </span>


                            <span className="text-muted-foreground">

                              🛍️{' '}
                              {
                                (
                                  o.items ||
                                  []
                                ).length
                              }{' '}
                              producto(s)

                            </span>

                          </div>

                        </div>


                        {/* =================================================
                            DETALLE PEDIDO
                        ================================================= */}

                        {isOpen && (

                          <div className="mt-5 border-t pt-4 space-y-5">


                            {/* PRODUCTOS */}

                            <div>

                              <p className="font-medium mb-3">
                                Productos
                              </p>


                              <div className="space-y-2">

                                {(
                                  o.items ||
                                  []
                                ).map(
                                  (
                                    item,
                                    idx
                                  ) => (

                                    <div
                                      key={
                                        idx
                                      }
                                      className="flex items-center gap-4 p-3 border rounded-lg"
                                    >


                                      {/* IMAGEN */}

                                      <div className="w-32 h-32 flex-shrink-0">

                                        {item.image ? (

                                          <img
                                            src={
                                              item.image
                                            }
                                            className="w-32 h-32 object-contain rounded-lg border bg-white"
                                            alt={
                                              item.name
                                            }
                                          />

                                        ) : (

                                          <div className="w-32 h-32 flex items-center justify-center border rounded-lg text-xs text-muted-foreground">
                                            Sin imagen
                                          </div>

                                        )}

                                      </div>


                                      {/* INFORMACIÓN */}

                                      <div className="flex-1 min-w-0">

                                        <div className="flex items-center gap-2">

                                          <span className="font-medium truncate">

                                            {
                                              item.name
                                            }

                                          </span>


                                          <span className="text-muted-foreground">

                                            x
                                            {
                                              item.qty
                                            }

                                          </span>

                                        </div>


                                        <div className="text-sm text-muted-foreground mt-1">

                                          $
                                          {Number(
                                            item.price ||
                                              0
                                          ).toLocaleString(
                                            'es-AR'
                                          )}{' '}
                                          c/u

                                        </div>


                                        <div className="font-semibold mt-2">

                                          Subtotal: $
                                          {(
                                            Number(
                                              item.price ||
                                                0
                                            ) *
                                            Number(
                                              item.qty ||
                                                0
                                            )
                                          ).toLocaleString(
                                            'es-AR'
                                          )}

                                        </div>

                                      </div>

                                    </div>

                                  )
                                )}

                              </div>

                            </div>


                            {/* RECETA */}

                            {o.prescriptionUrl && (

                              <div>

                                <p className="font-medium mb-2">
                                  Receta
                                </p>


                                <img
                                  src={
                                    o.prescriptionUrl
                                  }
                                  className="w-40 rounded-xl border cursor-pointer hover:opacity-90"
                                  alt="Receta"
                                  onClick={() =>
                                    window.open(
                                      o.prescriptionUrl,
                                      '_blank'
                                    )
                                  }
                                />

                              </div>

                            )}


                            {/* TOTAL */}

                            <div className="border-t pt-4">

                              <div className="flex justify-between items-center">

                                <span className="font-semibold">
                                  Total del pedido
                                </span>

                                <span className="text-xl font-bold">

                                  $
                                  {orderTotal.toLocaleString(
                                    'es-AR'
                                  )}

                                </span>

                              </div>

                            </div>

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


        {/* =================================================
            PRODUCTOS
        ================================================= */}

        {isLoading ? (

          <p>
            Cargando productos...
          </p>

        ) : (

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {products.map((p) => (

              <div
                key={p.id}
                className="border p-3 rounded-xl"
              >


                <ProductCardCarousel
                  images={
                    p.images ||
                    p.gallery ||
                    []
                  }
                />


                <p className="font-semibold mt-2">
                  {p.name}
                </p>


                <p>
                  $
                  {Number(
                    p.price || 0
                  ).toLocaleString(
                    'es-AR'
                  )}
                </p>


                <div className="flex justify-end gap-2 mt-3">


                  <button
                    type="button"
                    onClick={() =>
                      startEdit(p)
                    }
                    className="p-2 rounded hover:bg-gray-100"
                  >

                    <Edit2 className="w-5 h-5" />

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      deleteMutation.mutate(
                        p.id
                      )
                    }
                    className="p-2 rounded hover:bg-red-50 text-red-600"
                  >

                    <Trash2 className="w-5 h-5" />

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