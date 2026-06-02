import React from 'react';
import { Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CartItemRow({ item, onRemove }) {
  return (
    <div className="flex items-center gap-5 p-5 rounded-xl bg-card border border-border">
<div className="w-20 h-20 flex items-center justify-center overflow-hidden rounded-lg bg-muted">
  <img
    src={item.image_url}
    className="w-full h-full object-contain"
    alt={item.name}
  />
</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.brand || 'OCULAR'}</p>
        <p className="font-heading font-semibold truncate">{item.name}</p>
        <p className="font-heading text-lg font-bold text-primary">${item.price?.toLocaleString()}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)} className="text-muted-foreground hover:text-destructive">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}