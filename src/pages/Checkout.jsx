import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, ArrowLeft, ShieldCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
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
const [paymentMethod, setPaymentMethod] = useState('mp'); 
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState(1);
const params = new URLSearchParams(
  window.location.search
);

const [checkingPayment, setCheckingPayment] =
  useState(
    params.get('status') === 'success' &&
    params.get('payment_id')
  );
  const [prescription, setPrescription] = useState(null);
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, [step]);



useEffect(() => {

  const params = new URLSearchParams(
    window.location.search
  );

   console.log(
    'MP PARAMS',
    Object.fromEntries(params.entries()))


  const isReturningFromMP =
    params.get('status') === 'success' &&
    params.get('payment_id');

  if (isReturningFromMP) {
    return;
  }

  const c = getCart();

  if (!c || c.length === 0) {
    navigate('/cart');
    return;
  }

  setCart(c);

}, [navigate]);


useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  const status = params.get('status');
  const paymentId = params.get('payment_id');

  if (status === 'success' && paymentId) {
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
      })
      .finally(() => {
        setCheckingPayment(false);
      });

    return;
  }

  if (status === 'failure') {
    setStep(5);
  }

  if (status === 'pending') {
    setStep(6);
  }

  setCheckingPayment(false);
}, []);


  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

 const canProceedStep1 =
  !!prescription?.file_url || prescription?.skipped;
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

const uploadProof = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload-transfer-proof.php', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  return data.file_url;
};


const handleTransferOrder = async () => {
  setSubmitting(true);

  try {
    let proofUrl = null;

    if (prescription?.transferProof) {
      proofUrl = await uploadProof(prescription.transferProof);
    }

    const res = await fetch('/api/orders.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cart,
        customer,
        prescription,
        payment_method: 'transfer',
        transfer_proof: proofUrl,
      }),
    });

    const data = await res.json();

    if (!data.success) throw new Error('Error creando orden');

    clearCart();
    setStep(4);

  } catch (err) {
    console.error(err);
    alert('Error enviando transferencia');
  }

  setSubmitting(false);
};


const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);

    toast.success('Copiado al portapapeles', {
      description: text,
    });
  } catch (err) {
    toast.error('Error al copiar');
  }
};


if (checkingPayment) {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Verificando pago...</p>
      </div>
    </div>
  );
}


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
          Carrito
        </h1>

        <p className="text-muted-foreground mb-8">
          Paso {step} de 3
        </p>

        {/* STEP CONTENT */}
        {step === 1 && (
          <>
<PrescriptionUpload
  onPrescriptionReady={(data) => {
    setPrescription(data);

    // Solo avanzar automáticamente si eligió continuar sin receta
    if (data?.skipped) {
      setStep(2);
    }
  }}
/>

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

    {/* PAYMENT METHOD */}
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">

      <div
        onClick={() => setPaymentMethod('mp')}
        className={`border rounded-xl p-4 cursor-pointer transition ${
          paymentMethod === 'mp' ? 'border-primary bg-primary/5' : ''
        }`}
      >
        <h3 className="font-bold mb-1">MercadoPago</h3>
        <p className="text-sm text-muted-foreground">
          Tarjeta / efectivo / automático
        </p>
      </div>

      <div
        onClick={() => setPaymentMethod('transfer')}
        className={`border rounded-xl p-4 cursor-pointer transition ${
          paymentMethod === 'transfer' ? 'border-primary bg-primary/5' : ''
        }`}
      >
        <h3 className="font-bold mb-1">Transferencia bancaria</h3>
        <p className="text-sm text-muted-foreground">
          Pago manual con comprobante
        </p>
      </div>

    </div>

    {/* TRANSFER INFO */}
    {paymentMethod === 'transfer' && (
      <div className="p-4 border rounded-xl mb-6 bg-muted/30">
        <h3 className="font-bold mb-2">Datos bancarios</h3>

        <p><b>Banco:</b> Banco Nación</p>
<p>
  <b>CBU:</b>{' '}
  <span
    onClick={() => copyToClipboard('0000003100000000000000')}
    className="cursor-pointer text-primary underline"
    title="Click para copiar"
  >
    0000003100000000000000
  </span>
</p>

<p>
  <b>Alias:</b>{' '}
  <span
    onClick={() => copyToClipboard('OPTICA.LENTES.PAGO')}
    className="cursor-pointer text-primary underline"
    title="Click para copiar"
  >
    OPTICA.LENTES.PAGO
  </span>
</p>
        <p><b>Titular:</b> Óptica Online SRL</p>

<div className="mt-4">
  <label className="text-sm font-medium block mb-2">
    Comprobante de pago
  </label>

  <label className="cursor-pointer block">
    <div className="border-2 border-dashed rounded-xl p-4 text-center hover:bg-muted/30 transition">
      <p className="text-sm font-medium">
        📎 Subir comprobante
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        JPG, PNG o PDF
      </p>
    </div>

    <input
      type="file"
      accept="image/*,.pdf"
      className="hidden"
      onChange={(e) => {
        setPrescription(prev => ({
          ...prev,
          transferProof: e.target.files[0]
        }));
      }}
    />

    {prescription?.transferProof && (
  <p className="text-xs text-green-600 mt-2">
    ✔ Archivo seleccionado: {prescription.transferProof.name}
  </p>
)}
  </label>
</div>
      </div>
    )}

    {/* BOTÓN FINAL (IMPORTANTE) */}
    <Button
      className="w-full mt-6"
      onClick={() => {
        if (paymentMethod === 'mp') {
          handleSubmit();
        } else {
          handleTransferOrder();
        }
      }}
      disabled={submitting}
    >
      Confirmar pedido
    </Button>

    {/* CART */}
    <div className="mt-10 border rounded-xl p-4">
      {cart.map((item) => (
        <div key={item.id} className="flex justify-between py-2">
          <span>{item.name}</span>
          <span>${item.price}</span>
        </div>
      ))}
    </div>
  </>
)}

    



      </div>
    </div>
  );
}

