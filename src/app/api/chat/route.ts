import { convertToModelMessages, UIMessage, streamText } from "ai";

export async function POST(req: Request) {
  const { messages, model, webSearch }: { messages: UIMessage[]; model: string; webSearch: boolean } =
    await req.json();

  // 🔹 Debugging logs
  console.log("Received messages:", messages);
  console.log("Selected model:", model);
  console.log("Web search enabled:", webSearch);
  console.log("Using engine:", process.env.AZURE_OPENAI_ENGINE);
  console.log("API key loaded:", !!process.env.AZURE_OPENAI_KEY);

  try {
    // Call streamText (non-streaming)
    const response = await streamText({
      model: process.env.AZURE_OPENAI_ENGINE || model,
      messages: convertToModelMessages(messages),
      system: "You are a helpful assistant..."
    });

    // Convert StreamTextResult to string safely
    const fullText = (response as any)?.text ?? "⚠️ No reply";

    console.log("Assistant reply:", fullText); // 🔹 Debugging log

    return new Response(
      JSON.stringify({ reply: fullText }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Azure OpenAI Error:", err);
    return new Response(
      JSON.stringify({ reply: "⚠️ Error fetching LLM response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
