import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CustomerForm({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-xl font-semibold mb-2">Datos de Envío</h3>
        <p className="text-sm text-muted-foreground">Completá tus datos para recibir el pedido.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              placeholder="Juan Pérez"
              value={data.name || ''}
              onChange={(e) => update('name', e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="juan@email.com"
              value={data.email || ''}
              onChange={(e) => update('email', e.target.value)}
              className="rounded-lg"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            placeholder="+54 11 5555-0000"
            value={data.phone || ''}
            onChange={(e) => update('phone', e.target.value)}
            className="rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Dirección de envío</Label>
          <Textarea
            id="address"
            placeholder="Calle, número, piso, localidad, provincia, CP"
            value={data.address || ''}
            onChange={(e) => update('address', e.target.value)}
            className="rounded-lg min-h-[80px]"
          />
        </div>
      </div>
    </div>
  );
}