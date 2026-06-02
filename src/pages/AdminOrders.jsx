import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';





const getOrders = async () => {
  const res = await fetch('/api/orders.php');
  return res.json();
};

const statusColors = {
  "Pendiente": 'bg-yellow-500',
  "En proceso": 'bg-blue-500',
  "Terminados": 'bg-green-500',
  "Entregados": 'bg-purple-500',
};

export default function AdminOrders() {
  const [selectedImage, setSelectedImage] = useState(null);
  const queryClient = useQueryClient();
const [expandedId, setExpandedId] = useState(null);

const toggle = (id) => {
  setExpandedId(expandedId === id ? null : id);
};

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const updateStatus = async (id, status) => {
    await fetch('/api/orders.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });

    queryClient.invalidateQueries(['orders']);
  };

  const deleteOrder = async (id) => {
    await fetch('/api/orders.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    queryClient.invalidateQueries(['orders']);
  };

  return (
    <div className="pt-20 max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        🧾 Pedidos
      </h1>

      {orders.length === 0 ? (
        <p>No hay pedidos</p>
      ) : (
        <div className="space-y-4">
{orders.map((o) => {
  const isOpen = expandedId === o.id;

  return (
    <div
      key={o.id}
      className="border p-4 rounded-xl cursor-pointer transition"
      onClick={() => toggle(o.id)}
    >

      {/* HEADER SIEMPRE VISIBLE */}
      <div className="flex justify-between items-center">
        <p className="font-semibold">{o.customer?.name}</p>

        <span className={`px-2 py-1 text-white text-sm rounded ${statusColors[o.status] || 'bg-gray-400'}`}>
          {o.status}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        ${o.total}
      </p>

      {/* EXPANDIBLE */}
      {isOpen && (
        <div className="mt-4 space-y-3">

          <p><b>Email:</b> {o.customer?.email}</p>

          {/* RECETA SOLO EN EXPAND */}
          {o.prescriptionUrl && (
            <img
              src={o.prescriptionUrl}
              className="w-40 rounded-lg cursor-pointer hover:opacity-90"
              onClick={(e) => {
                e.stopPropagation(); // evita colapsar al abrir imagen
                setSelectedImage(o.prescriptionUrl);
              }}
            />
          )}

          {/* ACTIONS */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateStatus(o.id, 'En proceso');
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              En proceso
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                updateStatus(o.id, 'Terminados');
              }}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              Terminados
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                updateStatus(o.id, 'Entregados');
              }}
              className="px-3 py-1 bg-purple-500 text-white rounded"
            >
              Entregados
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteOrder(o.id);
              }}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              Eliminar
            </button>
          </div>

        </div>
      )}
    </div>
  );
})}
        </div>
      )}

      {/* LIGHTBOX */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-xl"
          />
        </div>
      )}
    </div>
  );
}