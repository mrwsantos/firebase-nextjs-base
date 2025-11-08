import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.GPT_KEY,
});

// Função simples para buscar informações (usando DuckDuckGo Instant Answer API)
async function searchWeb(query: string) {
    try {
        const response = await fetch(
            `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
        );

        const data = await response.json();

        if (data.Abstract) {
            return `${data.Abstract}\nSource: ${data.AbstractURL}`;
        }

        if (data.Answer) {
            return `${data.Answer}\nSource: ${data.AnswerURL}`;
        }

        return "No specific information found. Try a more specific query.";
    } catch (error) {
        console.error('Search error:', error);
        return "Search failed. Please try again.";
    }
}

export async function POST(request: NextRequest) {
    try {
        const { system, messages } = await request.json();

        const chatMessages = [
            { role: "system", content: system + "\n\nYou can search the web for current information when needed. Just ask yourself if you need to search for something, and call the search_web function." },
            ...messages.map((msg: { role: string; content: string }) => ({
                role: msg.role,
                content: msg.content,
            })),
        ];

        const functions = [
            {
                name: "search_web",
                description: "Search the web for current information using DuckDuckGo",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The search query"
                        }
                    },
                    required: ["query"]
                }
            }
        ];

        let completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            messages: chatMessages as any,
            functions: functions,
            function_call: "auto",
            temperature: 0.7,
            max_tokens: 2000,
        });

        let responseMessage = completion.choices[0]?.message;

        if (responseMessage?.function_call) {
            const functionArgs = JSON.parse(responseMessage.function_call.arguments || '{}');
            const functionResult = await searchWeb(functionArgs.query);

            const updatedMessages = [
                ...chatMessages,
                responseMessage,
                {
                    role: "function",
                    name: "search_web",
                    content: functionResult
                }
            ];

            completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                messages: updatedMessages as any,
                temperature: 0.7,
                max_tokens: 2000,
            });

            responseMessage = completion.choices[0]?.message;
        }

        const content = responseMessage?.content;

        if (!content) {
            return NextResponse.json(
                { error: "No response from ChatGPT" },
                { status: 500 }
            );
        }

        return NextResponse.json({ content });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error calling ChatGPT API:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}