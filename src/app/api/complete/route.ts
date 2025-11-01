import { NextRequest } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { transformStream } from "@crayonai/stream";

// Thesys Visualize client for completion tab
const thesysClient = new OpenAI({
  baseURL: "https://api.thesys.dev/v1/visualize",
  apiKey: process.env.THESYS_API_KEY,
});

const system_prompt =`
  Generate a ui based on user query and output.
  Also render table and chart and metrics card beautifully if table_data and chart_data are provided.
  Position Table Data and Chart Data in such way that it takes position and space properly.
  Generate metric cards also based on output. 
  If table data or chart data is small try to make layout side by side otherwise let those take full width.
  Try to generate different types of charts.
  If it's possible give more weightage to show pie chart if it's possible.
  Give buttons on metrics card or insights card to perform actions.
`


// const apiCall = async (prompt: string) => {
//   const bkReqBody = {
//     id: crypto.randomUUID(),
//     messages: [
//       { role: "user", content: prompt }
//     ],
//     model: "Best Model"
//   };

//   const res = await fetch('http://localhost:8001/api/chat/client/agent', {
//     method: "POST",
//     headers: bkHeaders,
//     body: JSON.stringify(bkReqBody)
//   });
//   const data = await res.json();
//   console.log("BK output:", data);
//   return data;
//   // Example expected structure of data:
//   // {
//   //   output: "...",
//   //   table_data: [...],
//   //   chart_data: [...]
//   // }
// }
export async function POST(req: NextRequest) {
  
  const { prompt, previousC1Response } = (await req.json()) as {
    prompt: string;
    previousC1Response?: string;
  };
  console.log("previousC1Response", previousC1Response);

  const messages: ChatCompletionMessageParam[] = [];

  // if (previousC1Response) {
  //   messages.push({
  //     role: "assistant",
  //     content: previousC1Response,
  //   });
  // }

  // This block demonstrates how to replicate the above curl command in Node using fetch.
  // It will send the user's prompt to the BK API and log the output.


  


  // Call the BK API first to get the analysis output
  
  
  messages.push({
    role: "system",
    content: system_prompt,
  });
  messages.push({
    role: "user",
    content: prompt,
  });

  // Use a different model routing to represent the "completion" tab behavior
  const llmStream = await thesysClient.chat.completions.create({
    model: "c1-nightly",
    messages: [...messages],
    stream: true,
  });

  const responseStream = transformStream(llmStream, (chunk) => {
    return chunk.choices[0]?.delta?.content || "";
  });

  return new Response(responseStream as ReadableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}


