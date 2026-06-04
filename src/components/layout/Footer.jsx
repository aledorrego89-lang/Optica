import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-foreground text-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <span className="font-heading font-semibold text-lg tracking-tight">
                Optica Blanco<span className="text-primary">.</span>
              </span>
            </div>
            <p className="text-sm text-background/60 leading-relaxed max-w-xs">
              Precisión óptica y diseño de vanguardia. Tu visión, nuestra obsesión.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm tracking-widest uppercase mb-6">Navegación</h4>
            <div className="space-y-3">
              <Link to="/catalog" className="block text-sm text-background/60 hover:text-primary transition-colors">Colección</Link>
              <Link to="/try-on" className="block text-sm text-background/60 hover:text-primary transition-colors">Probador Virtual</Link>
              <Link to="/cart" className="block text-sm text-background/60 hover:text-primary transition-colors">Carrito</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm tracking-widest uppercase mb-6">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-background/60">
                <Mail className="w-4 h-4 text-primary" />
                contacto@ocular.com
              </div>
              <div className="flex items-center gap-3 text-sm text-background/60">
                <Phone className="w-4 h-4 text-primary" />
                +54 9 2914 35-3276
              </div>
              <div className="flex items-center gap-3 text-sm text-background/60">
                <MapPin className="w-4 h-4 text-primary" />
                Buenos Aires, Argentina
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-background/10 text-center">
          <p className="text-xs text-background/40">
            © 2026 OCULAR. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}