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

const bkHeaders = {
  "accept": "*/*",
  "accept-language": "en-US,en;q=0.9",
  "content-type": "application/json",
  "origin": "https://dev.bluekaktus.ai",
  "priority": "u=1, i",
  "referer": "https://dev.bluekaktus.ai/",
  "sec-ch-ua": '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  "workspace-id": "c6129e91-6acf-4984-9ae4-0e238edca17e",
  "x-org-name": "bluekaktus.com",
  "cookie": 'email="suraj.narayan@bluekaktus.com"; org_name=bluekaktus.com; access_token=eyJraWQiOiJhd1dYU1NzSnpYSWk5YkZqN2hUOEVoTEhXTURUZ2FWRWtFdWlUdzFWdlF3PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI1MWEzNmQ0YS0xMDgxLTcwNWQtM2VjNC1lMjIyYTgyZjliZjgiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGgtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aC0xX3ExU21iY29XcCIsImNsaWVudF9pZCI6IjNtZGliNWxoNDZyc20yN2RrbXRpb2hzOWdqIiwib3JpZ2luX2p0aSI6IjJhYWJlOTc4LWY1YzYtNDg5MC1iMTc4LTg5MmVmYTU3NTJlNCIsImV2ZW50X2lkIjoiMzAwZjQ1NWUtNTYzYy00OTJkLThlYzktYTIxMzA0MWZkOTNiIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTc2MTczMDY3NywiZXhwIjoxNzYxODE3MDc3LCJpYXQiOjE3NjE3MzA2NzcsImp0aSI6ImFkYTRlMGNjLTdhMDYtNDk0Ny1hZWFmLTUzNTBlNGJhNGEyNCIsInVzZXJuYW1lIjoiNTFhMzZkNGEtMTA4MS03MDVkLTNlYzQtZTIyMmE4MmY5YmY4In0.Bh3dby3Jra2Sl6yiwqfcq0gDqpLa1U_5TZQs3Iollq0WuVuLTNMgZpqF3yVZX1Hrw8gnhobd3Z9XSsOUvk4q9a5I6STmUVRGX5ijmPH9r9rvPDsDIP6uaQCLDIMBcHL4AY2S4gJb4a9O-5gH9fZMeeqJf-bih9FN6o2tC73avJecU9l_fcLr43KLphB1vYKEgDziGjStd-NPV5a3bPPKxVTxl1KLIHY0C9ROdSYcMNO18dRfKy_kTFEOItzIiDdnW7I4M4K8lFI7NF_4B7l-HRVFOG9SjQGlOdbI5N6x0Fl6c9cebEOL6JtkHZE0IrYQnEX8PSL3WE3Nobll34Jn6w; refresh_token=eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.JKASlnj4K3VncMKT3nz3xOdT_xaPIYMDjEgdOmboYMS9XSJkRy7IKM0I7ddLjniM0BJdqcX4_7UaFgRFxtEZ4oAbRGCb-3NmWK7QgNYq0gH8DTpDKRcRmcIZtg9PDmWIsKq3V5vMSgGfMVJytKzTC4FD4CsxRRVHiJWxLMm6B2ZogItEr2ubCha1-itLwAQUQx80lX-vrOMrheWh3Y3OqTgfUd_Ha8zaz69MUBiYJk5jFvp-vJ2W0tEmKLw19nDEbwxV-rgLTxGdVaJjKlE28MH0oxc7-XpE7EXG5k9ipUUtuQQFcS5ZZwMIqQf0qgR4zuRgwt5Y29B-wzwWlaZhPA.xv5H1zpyQT_TL7vc.4ZyvXgd5JQZr5kJlS_efmsyY-uQ73nMcOi7TY4fIT8b_ip1U-3v3eAz9boxeo5dGKzJTKrp4NkHF9-X67P14FGDTCTsKxSaE58aNdcqzAfALRC8N4Vzy0ha9nINvRJBpCRYp9DOpijuG6lTgOVSSVRnG6FAwd1aMoxrpnJXSgfsMVePJqxM7U0neVjn-4YPHRs2H3PzH-yjBT3GmZz_dwPdl8GX1xPXmmCR65RXID5wyhuAv68uFEtBkoApMZyArDv9JfT3zBH5wnqQvVEreT14TmO_h4b6aCG_PDfwLrYqgAGBHoCOkTlH433jmFGvpliCgnQ82Kv8z-7xa6df2DWK0TdBL27TcpFoUpFKIYcCpERKEZqf9RaXJefTWE_tFGQHLOi1KWPoOQLpISLXn1yTsM1wx_jz4taxshU7CN-D9obCPA3ggWKC7JSIwMMG52YxoNeLCvJ9c9i8yhuahlSTbOMeeS8JyKdojhW9eKnJlI0LXsJ83nel1eviNgUPMOvUotkFHp6o_C-1Aa_fG1RYxf6nyQAP5GvCuSr0pNcCyWPO14ILg_ogGWEfBvPdOF6wcMA9JKmNpHLJ15oUiPG7C8jNkQGn3WiT_FFau4PsBlDBhS_SwTrIeuWHp82NNVzwMeh2hrPTcI7Y5eT_Q29rgPcJ0D9BVz6zzWtqh8nRtunoYO0TKdTa1xCMyuT39ZxZ0cQrUsgvNTmpNiG91jDioe6lQOHC9IsNBOXj2AtaldFznb-runljEkPVQoTybxm7TrdtGFF2Ui8dUzVD7e0rqW6BJMlvyKl3E0-u3nPsIizvhO0pdXszR8vIxrsQNjhxngcEr-0n7uZnWWHITQzbQsUOc2QiTOg5vUFWqDDfTfkDyR7BYdDlznQIHksaX2fIBHdd4AINRIJZmM7App_X8v2i_o666L2S-ocDBHGpaKVkSCp13StZZGv9a0n7PTuAqvZGWouU-CE_4m9EUS5tn6tlZ6JcPDj0XfCGv_GNNwxpw-oNFygpKiYcAQK24SO2hLjWA2zUalXOTCxG7sS34umRbZ-LPXav2fy0zi1dvxu0VhO1atJCSjqJvp-o_N9FfKf5HbJDLWDtSKGpdDqxNee72hktbqif4wzCuc0_QlQ2gjhcim6a5r1AaMPMihZ9ARu-JqWyfKlVA6xq5c0UjICBDQLMmGOnej3n4nrtsC55iPFpmEyEjLlbWotahd27v7F7RxT__Ta1jaKfPzVabngnf1MJfHMiRCyEP-j_dZq6LPyBIQUNTSAv3BYS-dxe_b5WXTh1MExXc5F5UxLfDYRcciSIl2clOlotsp829e1vQGRlCRZ3SdDkJ7w.QDGK5duescw-IkKFVIX7TQ; id_token=eyJraWQiOiJkUW05NGZyalZhbTh2eFBNZHcwZzVMTm5NenczQmg2aG5WVWtpSGpaOXZvPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI1MWEzNmQ0YS0xMDgxLTcwNWQtM2VjNC1lMjIyYTgyZjliZjgiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiY3VzdG9tOm9yZ05hbWUiOiJibHVla2FrdHVzLmNvbSIsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1zb3V0aC0xLmFtYXpvbmF3cy5jb21cL2FwLXNvdXRoLTFfcTFTbWJjb1dwIiwiY29nbml0bzp1c2VybmFtZSI6IjUxYTM2ZDRhLTEwODEtNzA1ZC0zZWM0LWUyMjJhODJmOWJmOCIsImdpdmVuX25hbWUiOiJTdXJhaiIsIm9yaWdpbl9qdGkiOiJlMjUxMGJlYi03M2JkLTQ1MjgtODRhYS04YjEzOGQ0NzViY2IiLCJhdWQiOiIzbWRpYjVsaDQ2cnNtMjdka210aW9oczlnaiIsImV2ZW50X2lkIjoiNzQyNDM2ZjQtMmRkZS00ZjNmLThjMGMtOTBiNDU1MGRmZDZiIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NTU1MDg0OTMsImV4cCI6MTc1NTU5NDg5MywiaWF0IjoxNzU1NTA4NDkzLCJmYW1pbHlfbmFtZSI6Ik5hcmF5YW4iLCJqdGkiOiJkNjQzZjFhMS0wZmYxLTQ4M2UtYjFiMC0xZjNmNDYzY2ZkYjUiLCJlbWFpbCI6InN1cmFqLm5hcmF5YW5AYmx1ZWtha3R1cy5jb20ifQ.f5rVTUhSLEQMbKL0nZpSv9pBclLUF9jdtDWNtp1wVqw-aGQFFUdYmrx3maYIemK8cz-UgOlK8D3mI3M2pvIokPiRJHIGqENE4fnv2lc5s6wGQ_6lvQHGtm33Zn-kmWHW_RWNwjUp4a9idYZsyeapjy4tPKmnf_MkLVtCa1_ywaruBTatKrVMV0lmqjW6oi5EU0u18dv7qRWOSvqq1ZrfT4WHnhFTUJrlCKBq6II--jzixvdooGB6liF0WZIIFypaA0_2FB_AjLHKZp5RQxdAoIuwXIEZo-5GuVYxIIjcAeaMkgauZEDlOheua9mIox63NlwDsFOwL8Wa7yHluLv4rA'
  // Note: Replace long token/cookie values for security in a real implementation.
};

const apiCall = async (prompt: string) => {
  const bkReqBody = {
    id: crypto.randomUUID(),
    messages: [
      { role: "user", content: prompt }
    ],
    model: "Best Model"
  };

  const res = await fetch('http://localhost:8001/api/chat/client/agent', {
    method: "POST",
    headers: bkHeaders,
    body: JSON.stringify(bkReqBody)
  });
  const data = await res.json();
  console.log("BK output:", data);
  return data;
  // Example expected structure of data:
  // {
  //   output: "...",
  //   table_data: [...],
  //   chart_data: [...]
  // }
}
export async function POST(req: NextRequest) {
  
  const { prompt, previousC1Response } = (await req.json()) as {
    prompt: string;
    previousC1Response?: string;
  };

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


