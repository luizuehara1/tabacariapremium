import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

dotenv.config();

// Initialize Firebase Admin
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8'));

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: firebaseConfig.projectId
    });
    console.log("Firebase Admin initialized successfully. Project ID:", admin.app().options.projectId);
  } catch (initError) {
    console.error("Firebase Admin initialization error:", initError);
  }
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "APP_USR-5439602477800429-051811-ae92db916ab15d21c093fa83cf0941a9-2615299865" 
  });

  // API Routes
  app.post("/api/create-preference", async (req, res) => {
    try {
      console.log("Iniciando criação de preferência Mercado Pago...");
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
            success: `${process.env.APP_URL || 'https://ais-dev-szso4kgv4xyhdvruieoknf-158810650718.us-east5.run.app'}/#/success`,
            failure: `${process.env.APP_URL || 'https://ais-dev-szso4kgv4xyhdvruieoknf-158810650718.us-east5.run.app'}/#/failure`,
            pending: `${process.env.APP_URL || 'https://ais-dev-szso4kgv4xyhdvruieoknf-158810650718.us-east5.run.app'}/#/pending`,
          },
          auto_return: 'approved',
          external_reference: external_reference,
          notification_url: `${process.env.APP_URL || 'https://ais-dev-szso4kgv4xyhdvruieoknf-158810650718.us-east5.run.app'}/api/webhook`,
          statement_descriptor: 'VAPOR STREET'
        }
      });

      console.log("Preferência criada com sucesso. ID:", result.id);
      res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
      console.error('Error creating preference:', error);
      res.status(500).json({ error: 'Failed to create preference' });
    }
  });

  app.post("/api/create-pix-payment", async (req, res) => {
    try {
      console.log("Iniciando criação de pagamento Pix...");
      const { amount, description, orderId, payer, items } = req.body;
      
      if (!amount || Number(amount) <= 0) {
        return res.status(400).json({ error: "Valor inválido para gerar PIX." });
      }

      const payment = new Payment(client);
      
      const result = await payment.create({
        body: {
          transaction_amount: Number(amount),
          description: description || "Pedido Tabacaria",
          payment_method_id: "pix",
          external_reference: orderId,
          notification_url: `${process.env.APP_URL || 'https://ais-dev-szso4kgv4xyhdvruieoknf-158810650718.us-east5.run.app'}/api/webhook`,
          payer: {
            email: payer.email || "contato@vaporstreet.com.br",
            first_name: payer.first_name || "Cliente",
          }
        },
        requestOptions: {
          idempotencyKey: orderId
        }
      });

      console.log("Pagamento Pix criado com sucesso. ID:", result.id);

      res.json({
        id: result.id,
        qr_code: result.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
        external_reference: orderId
      });
    } catch (error: any) {
      console.error("Erro ao criar pagamento Pix:", error);
      res.status(500).json({ error: error.message || "Erro ao gerar Pix" });
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
                status: 'approved',
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                payment_id: paymentId
              });
              console.log(`Order ${externalReference} marked as PAID (approved)`);
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
