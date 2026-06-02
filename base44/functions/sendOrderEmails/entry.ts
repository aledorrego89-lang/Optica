import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { customer, cart, total, prescriptionUrl, opticoEmail } = await req.json();

  const itemsHtml = cart.map(i => `<li>${i.name} — $${i.price?.toLocaleString()}</li>`).join('');

  // Email al cliente
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: customer.email,
    subject: '✅ Pedido recibido - OCULAR Precision',
    body: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h1 style="color:#1a1a2e;font-size:28px;margin-bottom:4px;">OCULAR Precision</h1>
        <p style="color:#6b7280;margin-top:0;">Tienda de Óptica Online</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <h2 style="color:#1a1a2e;">¡Hola, ${customer.name}!</h2>
        <p>Recibimos tu pedido correctamente. Nuestro equipo óptico fabricará tus lentes con la receta que enviaste.</p>
        <div style="background:white;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #e5e7eb;">
          <h3 style="margin-top:0;">Resumen del pedido</h3>
          <ul style="padding-left:20px;color:#374151;">${itemsHtml}</ul>
          <p style="font-size:20px;font-weight:bold;color:#1a1a2e;">Total: $${total.toLocaleString()}</p>
        </div>
        <p style="color:#374151;">Una vez que tus lentes estén listos, te avisaremos por este email para coordinar la entrega o el retiro en local.</p>
        <p style="color:#6b7280;font-size:13px;">Si tenés alguna consulta, respondé este email o escribinos al WhatsApp.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#9ca3af;font-size:12px;">— Equipo OCULAR Precision</p>
      </div>
    `,
  });

  // Email al óptico
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: opticoEmail,
    subject: `🆕 Nuevo pedido de ${customer.name}`,
    body: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h1 style="color:#1a1a2e;">Nuevo pedido recibido</h1>
        <div style="background:white;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #e5e7eb;">
          <h3 style="margin-top:0;">Cliente</h3>
          <p><strong>Nombre:</strong> ${customer.name}</p>
          <p><strong>Email:</strong> ${customer.email}</p>
          <p><strong>Teléfono:</strong> ${customer.phone || '-'}</p>
          <p><strong>Dirección:</strong> ${customer.address}</p>
        </div>
        <div style="background:white;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #e5e7eb;">
          <h3 style="margin-top:0;">Productos</h3>
          <ul style="padding-left:20px;color:#374151;">${itemsHtml}</ul>
          <p style="font-size:18px;font-weight:bold;color:#1a1a2e;">Total: $${total.toLocaleString()}</p>
        </div>
        ${prescriptionUrl ? `<p><a href="${prescriptionUrl}" style="color:#2563eb;">📄 Ver receta adjunta</a></p>` : ''}
        <p style="color:#6b7280;font-size:13px;">Ingresá al panel de administración para ver el detalle completo del pedido.</p>
      </div>
    `,
  });

  return Response.json({ ok: true });
});