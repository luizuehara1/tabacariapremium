export default async function handler(req: any, res: any) {
  try {
    // Só aceita POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const { items } = req.body;

    // 🔑 Token Mercado Pago (vem da Vercel)
    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({ error: "Token Mercado Pago não configurado" });
    }

    // 🚀 Cria pagamento no Mercado Pago
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        items,

        back_urls: {
          success: "https://tabacariapremium.vercel.app/sucesso",
          failure: "https://tabacariapremium.vercel.app/erro",
          pending: "https://tabacariapremium.vercel.app/pendente",
        },

        auto_return: "approved",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Mercado Pago:", data);
      return res.status(500).json({
        error: "Erro ao criar preferência",
        details: data,
      });
    }

    return res.status(200).json({
      id: data.id,
      init_point: data.init_point,
    });

  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(500).json({ error: "Erro interno ao criar pagamento" });
  }
}
