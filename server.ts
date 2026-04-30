import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'tabacaria68'
  });
}

const db = admin.firestore();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' 
  });

  // API Routes
  app.post("/api/create-preference", async (req, res) => {
    try {
      const { items, external_reference, payer } = req.body;
      
      const preference = new Preference(client);
      const result = await preference.create({
        body: {
          items: items.map((item: any) => ({
            id: item.id,
            title: item.title,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            currency_id: 'BRL'
          })),
          payer: payer,
          back_urls: {
            success: `${process.env.APP_URL || 'http://localhost:3000'}/#/success`,
            failure: `${process.env.APP_URL || 'http://localhost:3000'}/#/failure`,
            pending: `${process.env.APP_URL || 'http://localhost:3000'}/#/pending`,
          },
          auto_return: 'approved',
          external_reference: external_reference,
          notification_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/webhook`,
          statement_descriptor: 'VAPOR STREET'
        }
      });

      res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
      console.error('Error creating preference:', error);
      res.status(500).json({ error: 'Failed to create preference' });
    }
  });

  app.post("/api/create-pix-payment", async (req, res) => {
    try {
      const { items, total, address, customerName } = req.body;
      const orderId = `ORDER-${Date.now()}`;
      
      const payment = new Payment(client);
      
      const result = await payment.create({
        body: {
          transaction_amount: Number(total),
          description: items.map((i: any) => i.title).join(", "),
          payment_method_id: "pix",
          external_reference: orderId,
          notification_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/webhook`,
          payer: {
            email: "contato@tabacaria68.com.br", // Using a more appropriate domain
            first_name: customerName || "Cliente",
            last_name: "Visitante"
          }
        },
        requestOptions: {
          idempotencyKey: orderId
        }
      });

      // Initializing order in Firestore as Pending
      await db.collection('orders').doc(orderId).set({
        customerName: customerName || "Cliente Visita",
        address: address,
        paymentMethod: 'pix',
        items: items,
        total: total,
        status: 'Pendente',
        payment_id: result.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({
        id: result.id,
        qr_code: result.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
        external_reference: orderId
      });
    } catch (error: any) {
      console.error("Erro Pix MP:", error);
      // Detailed error logging to help diagnose Mercado Pago issues
      const errorMessage = error.message || "Erro ao criar pagamento Pix";
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/webhook", async (req, res) => {
    console.log("Webhook recebido:", req.body);
    const { body, query } = req;
    
    // Mercado Pago provides the type of notification
    const type = body.type || query.type;
    const paymentId = body?.data?.id || query['data.id'];

    console.log(`Webhook received: Type=${type}, ID=${paymentId}`);

    if (type === 'payment' && paymentId) {
      try {
        const ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
        
        // Securely fetch payment details from MP API
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`
          }
        });

        if (!response.ok) {
          throw new Error(`MP API responded with ${response.status}`);
        }

        const payment = await response.json();
        const status = payment.status;
        const externalReference = payment.external_reference;

        console.log(`Payment ${paymentId} status: ${status} for Ref: ${externalReference}`);

        if (status === 'approved') {
          console.log(`✅ SUCCESS: Payment approved for order ${externalReference}`);
          
          if (externalReference) {
            try {
              await db.collection('orders').doc(externalReference).update({
                status: 'Aceito',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                payment_id: paymentId
              });
              console.log(`Order ${externalReference} marked as PAID (Aceito)`);
            } catch (fsError) {
              console.error(`Error updating order ${externalReference} in Firestore:`, fsError);
            }
          }
        }
      } catch (error) {
        console.error('Error processing MP notification:', error);
      }
    }

    // Always respond with 200 or 201 to MP
    res.status(200).send("OK");
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
