import { NextRequest } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { messages, system } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-20250514", // Mais recente e poderoso
        max_tokens: 8192, // 4x mais que você estava usando
        system,
        messages,
      },
      {
        headers: {
          "x-api-key": process.env.CLAUDE_API_KEY!,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
      }
    );

    // response.data provavelmente tem o texto da resposta em um campo específico, por exemplo:
    // console.log(response.data);
    const content = response.data.content?.[0]?.text ?? "No content returned.";

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("ERRO CLAUDE FULL:", error.response?.data || error.message);
    return new Response(
      JSON.stringify({ error: error.response?.data || error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
