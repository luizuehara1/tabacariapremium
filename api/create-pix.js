export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Método não permitido. Use POST."
      });
    }

    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!token) {
      return res.status(500).json({
        error: "MERCADO_PAGO_ACCESS_TOKEN não configurado na Vercel."
      });
    }

    function parseMoneyToNumber(value) {
      if (typeof value === "number") return value;

      return Number(
        String(value)
          .replace("R$", "")
          .replace(/\s/g, "")
          .replace(",", ".")
          .replace(/[^\d.]/g, "")
      );
    }

    const amount = parseMoneyToNumber(req.body.amount);

    if (!amount || amount <= 0 || Number.isNaN(amount)) {
      return res.status(400).json({
        error: "Valor inválido para gerar PIX.",
        receivedAmount: req.body.amount
      });
    }

    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${Date.now()}-${Math.random()}`
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: req.body.description || "Pedido Tabacaria",
        payment_method_id: "pix",
        external_reference: req.body.orderId || String(Date.now()),
        payer: {
          email: req.body.payer?.email || "cliente@email.com",
          first_name: req.body.payer?.first_name || "Cliente"
        }
      })
    });

    const payment = await mpResponse.json();

    if (!mpResponse.ok) {
      return res.status(mpResponse.status).json({
        error: "Erro ao criar pagamento no Mercado Pago.",
        details: payment
      });
    }

    const qrCode = payment?.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = payment?.point_of_interaction?.transaction_data?.qr_code_base64;

    if (!qrCode || !qrCodeBase64) {
      return res.status(500).json({
        error: "Mercado Pago não retornou QR Code PIX.",
        paymentStatus: payment?.status,
        paymentId: payment?.id,
        paymentResponse: payment
      });
    }

    return res.status(200).json({
      paymentId: payment.id,
      status: payment.status,
      qrCode,
      qrCodeBase64
    });

  } catch (error) {
    console.error("Erro ao criar PIX:", error);

    return res.status(500).json({
      error: "Erro interno ao criar PIX.",
      details: String(error?.message || error)
    });
  }
}
