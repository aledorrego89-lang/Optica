import React, { useState } from 'react';
import { QrCode, CreditCard, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MP_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/MercadoPago_logo.svg/512px-MercadoPago_logo.svg.png';

export default function PaymentStep({ total, onMethodSelect, selectedMethod }) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm mb-6">
        Elegí cómo querés pagar. Recibirás un email con el link/QR de pago. Tu pedido se procesará una vez confirmado el pago por nuestro equipo.
      </p>

      {/* MercadoPago option */}
      <button
        onClick={() => onMethodSelect('mercadopago')}
        className={cn(
          'w-full p-5 rounded-xl border-2 text-left transition-all flex items-center gap-4',
          selectedMethod === 'mercadopago'
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card hover:border-primary/40'
        )}
      >
        <div className="w-12 h-12 rounded-xl bg-[#009EE3]/10 flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-6 h-6 text-[#009EE3]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-heading font-semibold">MercadoPago</span>
            <img src={MP_LOGO} alt="MercadoPago" className="h-4 object-contain" />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pagá con tu cuenta MP, QR, transferencia o cualquier medio
          </p>
        </div>
        <div className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
          selectedMethod === 'mercadopago' ? 'border-primary' : 'border-border'
        )}>
          {selectedMethod === 'mercadopago' && (
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          )}
        </div>
      </button>

      {/* Credit/Debit card option */}
      <button
        onClick={() => onMethodSelect('card')}
        className={cn(
          'w-full p-5 rounded-xl border-2 text-left transition-all flex items-center gap-4',
          selectedMethod === 'card'
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card hover:border-primary/40'
        )}
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <span className="font-heading font-semibold">Tarjeta de crédito / débito</span>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visa, Mastercard, American Express y más
          </p>
        </div>
        <div className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
          selectedMethod === 'card' ? 'border-primary' : 'border-border'
        )}>
          {selectedMethod === 'card' && (
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          )}
        </div>
      </button>

      {/* QR visual if MP selected */}
      {selectedMethod === 'mercadopago' && (
        <div className="mt-4 p-5 rounded-xl bg-[#009EE3]/5 border border-[#009EE3]/20 flex flex-col items-center gap-3">
          <QrCode className="w-8 h-8 text-[#009EE3]" />
          <p className="text-sm text-center text-muted-foreground">
            Al confirmar el pedido recibirás un email con el <strong>QR y link de pago</strong> de MercadoPago por un total de <strong className="text-foreground">${total.toLocaleString()}</strong>
          </p>
        </div>
      )}

      {selectedMethod === 'card' && (
        <div className="mt-4 p-5 rounded-xl bg-primary/5 border border-primary/20 flex flex-col items-center gap-3">
          <CreditCard className="w-8 h-8 text-primary" />
          <p className="text-sm text-center text-muted-foreground">
            Al confirmar el pedido recibirás un email con el link seguro para ingresar los datos de tu tarjeta y completar el pago de <strong className="text-foreground">${total.toLocaleString()}</strong>
          </p>
        </div>
      )}
    </div>
  );
}