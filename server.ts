import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import dotenv from 'dotenv';
import fs from 'fs';
import admin from 'firebase-admin';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin for Backend (Webhook updates etc)
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log("✅ Firebase Admin inicializado com sucesso.");
    } else {
      console.warn("⚠️ Firebase Admin não inicializado: Faltam variáveis de ambiente (FIREBASE_PROJECT_ID, etc).");
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar Firebase Admin:", error);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

function parseMoneyToNumber(value: any): number {
  if (typeof value === "number") return value;

  return Number(
    String(value)
      .replace("R$", "")
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!mpToken) {
    console.warn("⚠️ AVISO: MERCADO_PAGO_ACCESS_TOKEN não configurado. Pagamentos podem falhar.");
  }

  const client = new MercadoPagoConfig({ 
    accessToken: mpToken || "" 
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

  // RENAMED TO /api/create-pix
  app.post("/api/create-pix", async (req, res) => {
    try {
      const { amount: rawAmount, description, orderId, payer } = req.body;
      
      console.log("--- Gerando PIX ---");
      const amount = parseMoneyToNumber(rawAmount);
      
      console.log("amount recebido:", amount);
      console.log("token mercado pago existe:", !!process.env.MERCADO_PAGO_ACCESS_TOKEN);

      if (!amount || amount <= 0 || isNaN(amount)) {
        console.error("Erro: Valor inválido para PIX:", rawAmount);
        return res.status(400).json({ 
          error: "Valor inválido para gerar PIX.",
          receivedAmount: rawAmount 
        });
      }

      if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
        return res.status(500).json({ error: "MERCADO_PAGO_ACCESS_TOKEN não configurado no servidor." });
      }

      // Dinamicamente resolve a URL de notificação
      let notificationUrl = process.env.APP_URL || "";
      if (notificationUrl) {
        if (!notificationUrl.startsWith('http')) {
          notificationUrl = `https://${notificationUrl}`;
        }
        notificationUrl = notificationUrl.replace(/\/$/, "") + "/api/webhook";
      }

      const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": `${Date.now()}-${Math.random()}`
        },
        body: JSON.stringify({
          transaction_amount: amount,
          description: description || "Pedido Tabacaria",
          payment_method_id: "pix",
          external_reference: orderId || String(Date.now()),
          notification_url: notificationUrl || undefined,
          payer: {
            email: payer?.email || "cliente@email.com",
            first_name: payer?.first_name || "Cliente"
          }
        })
      });

      const payment: any = await mpResponse.json();
      console.log("Resposta Mercado Pago (JSON):", JSON.stringify(payment, null, 2));

      if (!mpResponse.ok) {
        console.error("Erro ao criar pagamento no Mercado Pago.");
        return res.status(mpResponse.status).json({
          error: "Erro ao criar pagamento no Mercado Pago.",
          details: payment
        });
      }

      const qrCode = payment?.point_of_interaction?.transaction_data?.qr_code;
      const qrCodeBase64 = payment?.point_of_interaction?.transaction_data?.qr_code_base64;

      if (!qrCode || !qrCodeBase64) {
        console.error("❌ Erro: Mercado Pago não retornou QR Code PIX.");
        return res.status(500).json({
          error: "Mercado Pago não retornou QR Code PIX.",
          paymentStatus: payment?.status,
          paymentId: payment?.id,
          paymentResponse: payment
        });
      }

      console.log("✅ PIX gerado com sucesso. ID:", payment.id);

      return res.status(200).json({
        paymentId: payment.id,
        status: payment.status,
        qrCode,
        qrCodeBase64
      });
    } catch (error: any) {
      console.error("Erro fatal ao criar pagamento Pix:", error);
      res.status(500).json({ 
        error: error.message || "Erro interno ao gerar Pix",
        details: error.cause || null
      });
    }
  });

  app.post("/api/webhook", async (req, res) => {
    const { body, query } = req;
    const type = body.type || query.type;
    const paymentId = body?.data?.id || query['data.id'];

    if (type === 'payment' && paymentId) {
      try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
          }
        });

        if (response.ok) {
          const payment = await response.json();
          const status = payment.status;
          const externalReference = payment.external_reference;

          if (status === 'approved' && db && externalReference) {
            console.log(`✅ Pagamento Aprovado: ${externalReference}. Atualizando Firestore...`);
            try {
              await db.collection('orders').doc(externalReference).update({
                status: 'approved',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                paidAt: admin.firestore.FieldValue.serverTimestamp()
              });
              console.log(`Pedido ${externalReference} atualizado com sucesso.`);
            } catch (fsError) {
              console.error(`Erro ao atualizar pedido ${externalReference} no Firestore:`, fsError);
            }
          }
        }
      } catch (error) {
        console.error('Erro no processamento do webhook:', error);
      }
    }

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
