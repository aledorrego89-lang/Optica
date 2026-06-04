import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, ArrowLeft, ShieldCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

import PrescriptionUpload from '@/components/checkout/PrescriptionUpload';
import CustomerForm from '@/components/checkout/CustomerForm';
import { getCart, clearCart } from '@/lib/cartUtils';

const OPTICO_EMAIL = 'aledorrego89@gmail.com';

/* =========================
   API PHP ORDER
========================= */
// const createOrder = async (orderData) => {
//   const res = await fetch('/api/orders.php', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(orderData),
//   });

//   return res.json();
// };

export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [step, setStep] = useState(1);
  const [prescription, setPrescription] = useState(null);
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const c = getCart();
    if (!c || c.length === 0) {
      navigate('/cart');
      return;
    }
    setCart(c);
  }, [navigate]);


  useEffect(() => {

  const params = new URLSearchParams(
    window.location.search
  );

  const status =
    params.get('status');

  const paymentId =
    params.get('payment_id');

  if (
    status === 'success' &&
    paymentId
  ) {

    fetch('/api/confirm-payment.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_id: paymentId,
      }),
    })
      .then(r => r.json())
      .then(() => {
        clearCart();
        setStep(4);
      });

    return;
  }

  if (status === 'failure') {
    setStep(5);
    return;
  }

  if (status === 'pending') {
    setStep(6);
    return;
  }

}, []);


  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  const canProceedStep1 = !!prescription?.file_url;
  const canProceedStep2 =
    customer.name && customer.email && customer.address;

  /* =========================
     SUBMIT ORDER
  ========================= */
const handleSubmit = async () => {
  setSubmitting(true);

  try {
    const res = await fetch('/api/create-payment.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cart,
        customer,
        prescription,
      }),
    });

    const data = await res.json();

console.log("STATUS MP RESPONSE:", res.status);
console.log("MP RESPONSE FULL:", data);

  

    if (!data.init_point) {
      throw new Error(data.error || 'No init_point');
    }

    window.location.href = data.init_point;

  } catch (err) {
    console.error(err);
    alert('Error iniciando Mercado Pago');
  }

  setSubmitting(false);
};

  /* =========================
     SUCCESS SCREEN
  ========================= */
  if (step === 4) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />

          <h1 className="text-3xl font-bold mb-4">
            ¡Pedido confirmado!
          </h1>

          <p className="text-muted-foreground mb-6">
            Te avisaremos por email cuando esté listo.
          </p>

          <Button onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        </motion.div>
      </div>
    );
  }


  if (step === 5) {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          Pago rechazado
        </h1>

        <Button onClick={() => navigate('/cart')}>
          Volver al carrito
        </Button>
      </div>
    </div>
  );
}

if (step === 6) {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          Pago pendiente
        </h1>

        <Button onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}

  /* =========================
     UI
  ========================= */
  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* HEADER */}
        <Button
          variant="ghost"
          onClick={() => step === 1 ? navigate('/cart') : setStep(step - 1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {step === 1 ? 'Volver' : 'Atrás'}
        </Button>

        <h1 className="text-4xl font-bold mt-6 mb-2">
          Checkout
        </h1>

        <p className="text-muted-foreground mb-8">
          Paso {step} de 3
        </p>

        {/* STEP CONTENT */}
        {step === 1 && (
          <>
            <PrescriptionUpload onPrescriptionReady={setPrescription} />

            <Button
              className="mt-6"
              disabled={!canProceedStep1}
              onClick={() => setStep(2)}
            >
              Continuar
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <CustomerForm data={customer} onChange={setCustomer} />

            <Button
              className="mt-6"
              disabled={!canProceedStep2}
              onClick={() => setStep(3)}
            >
              Revisar
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="p-6 border rounded-xl mb-6">
              <h2 className="font-bold mb-3">Resumen</h2>

              <p>Nombre: {customer.name}</p>
              <p>Email: {customer.email}</p>
              <p>Total: ${total}</p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                'Confirmar pedido'
              )}
            </Button>
          </>
        )}

        {/* CART SIDEBAR */}
        <div className="mt-10 border rounded-xl p-4">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between py-2">
              <span>{item.name}</span>
              <span>${item.price}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}