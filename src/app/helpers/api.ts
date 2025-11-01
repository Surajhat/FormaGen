/**
 * Type definition for parameters required by the makeApiCall function.
 * This includes both the API request parameters and state management callbacks.
 */
export type ApiCallParams = {
  /** The search query to be sent to the API */
  searchQuery: string;
  /** Optional previous response for context in follow-up queries */
  previousC1Response?: string;
  /** Callback to update the response state */
  setC1Response: (response: string) => void;
  /** Callback to update the loading state */
  setIsLoading: (isLoading: boolean) => void;
  /** Current abort controller for cancelling ongoing requests */
  abortController: AbortController | null;
  /** Callback to update the abort controller state */
  setAbortController: (controller: AbortController | null) => void;
  /** Optional callback to save response when complete */
  onResponseComplete?: (query: string, response: string) => void;
};

/**
 * Makes an API call to the /api/ask endpoint with streaming response handling.
 * Supports request cancellation and manages loading states.
 *
 * @param params - Object containing all necessary parameters and callbacks
 */
export const makeApiCall = async ({
  searchQuery,
  previousC1Response,
  setC1Response,
  setIsLoading,
  abortController,
  setAbortController,
  onResponseComplete,
}: ApiCallParams) => {
  try {
    // Cancel any ongoing request before starting a new one
    if (abortController) {
      abortController.abort();
    }

    // Create and set up a new abort controller for this request
    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    setIsLoading(true);

    // Make the API request with the abort signal
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: searchQuery,
        previousC1Response,
      }),
      signal: newAbortController.signal,
    });

    console.log("response", response.body);

    // Set up stream reading utilities
    const decoder = new TextDecoder();
    const stream = response.body?.getReader();

    if (!stream) {
      throw new Error("response.body not found");
    }

    // Initialize accumulator for streamed response
    let streamResponse = "";

    // Read the stream chunk by chunk
    while (true) {
      const { done, value } = await stream.read();
      // Decode the chunk, considering if it's the final chunk
      const chunk = decoder.decode(value, { stream: !done });

      // Accumulate response and update state
      streamResponse += chunk;
      console.log("streamResponse", streamResponse);
      console.log("chunk", chunk);
      console.log("type of chunk", typeof chunk);
      setC1Response(streamResponse);

      // Break the loop when stream is complete
      if (done) {
        break;
      }
    }

    // Call the completion callback if provided
    if (onResponseComplete && streamResponse.trim()) {
      onResponseComplete(searchQuery, streamResponse);
    }
  } catch (error) {
    console.error("Error in makeApiCall:", error);
  } finally {
    // Clean up: reset loading state and abort controller
    setIsLoading(false);
    setAbortController(null);
  }
};

const bkHeaders = {
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

  // Unwrapped cookie values as separate headers
  'org-name': 'bluekaktus.com',
  "email": "suraj.narayan@bluekaktus.com",
  "org_name": "bluekaktus.com",
  "access_token": "eyJraWQiOiJhd1dYU1NzSnpYSWk5YkZqN2hUOEVoTEhXTURUZ2FWRWtFdWlUdzFWdlF3PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI1MWEzNmQ0YS0xMDgxLTcwNWQtM2VjNC1lMjIyYTgyZjliZjgiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGgtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aC0xX3ExU21iY29XcCIsImNsaWVudF9pZCI6IjNtZGliNWxoNDZyc20yN2RrbXRpb2hzOWdqIiwib3JpZ2luX2p0aSI6IjM1MzNiZjYwLWIxM2YtNDJhNi04YmRkLWE5M2ZjNTUxNDE2NSIsImV2ZW50X2lkIjoiY2EzMzhjM2EtZDIwNS00ZTc0LWE0MzItYTlhZDk1ZmJlNWRjIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTc2MTgwMDU0MywiZXhwIjoxNzYxODg2OTQzLCJpYXQiOjE3NjE4MDA1NDMsImp0aSI6IjMyMWZmZTk4LWFkYzMtNDIzOC1iM2QwLTc2N2ZjZjBjNzlkNyIsInVzZXJuYW1lIjoiNTFhMzZkNGEtMTA4MS03MDVkLTNlYzQtZTIyMmE4MmY5YmY4In0.bPA5yN3cJAd3GN9FBWpmjxjQw-GsZK4lbXn5PmAbkMajKPzC__N0twtCl6xCOZRRR6jgaA1kzXBRftNmv9GN9wkwe9oj3pl6AfueB8eAWwWNWjmv8b-H_qFk68_X7E1XV1nIHwGibc3C8xqHpGqCRVhWcxR0u9dfSS76CrPoyYQwICIPiJ-cNzdlim2mLn87hylHLn94wR3QHCVhv6ZIEAyGsRM4mprq9ZaUk7J_j_jPnHU2WsqMQgzA3Nw3f71huMBNFsuGGJzD4RnJpY2gBJZYHzkZuu6tigQndhLw7w57CIS0TulrOU7Jn1QNKwbHWjyXS-bqZ5koGkiGeN6-eA",
  "refresh_token": "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.JKASlnj4K3VncMKT3nz3xOdT_xaPIYMDjEgdOmboYMS9XSJkRy7IKM0I7ddLjniM0BJdqcX4_7UaFgRFxtEZ4oAbRGCb-3NmWK7QgNYq0gH8DTpDKRcRmcIZtg9PDmWIsKq3V5vMSgGfMVJytKzTC4FD4CsxRRVHiJWxLMm6B2ZogItEr2ubCha1-itLwAQUQx80lX-vrOMrheWh3Y3OqTgfUd_Ha8zaz69MUBiYJk5jFvp-vJ2W0tEmKLw19nDEbwxV-rgLTxGdVaJjKlE28MH0oxc7-XpE7EXG5k9ipUUtuQQFcS5ZZwMIqQf0qgR4zuRgwt5Y29B-wzwWlaZhPA.xv5H1zpyQT_TL7vc.4ZyvXgd5JQZr5kJlS_efmsyY-uQ73nMcOi7TY4fIT8b_ip1U-3v3eAz9boxeo5dGKzJTKrp4NkHF9-X67P14FGDTCTsKxSaE58aNdcqzAfALRC8N4Vzy0ha9nINvRJBpCRYp9DOpijuG6lTgOVSSVRnG6FAwd1aMoxrpnJXSgfsMVePJqxM7U0neVjn-4YPHRs2H3PzH-yjBT3GmZz_dwPdl8GX1xPXmmCR65RXID5wyhuAv68uFEtBkoApMZyArDv9JfT3zBH5wnqQvVEreT14TmO_h4b6aCG_PDfwLrYqgAGBHoCOkTlH433jmFGvpliCgnQ82Kv8z-7xa6df2DWK0TdBL27TcpFoUpFKIYcCpERKEZqf9RaXJefTWE_tFGQHLOi1KWPoOQLpISLXn1yTsM1wx_jz4taxshU7CN-D9obCPA3ggWKC7JSIwMMG52YxoNeLCvJ9c9i8yhuahlSTbOMeeS8JyKdojhW9eKnJlI0LXsJ83nel1eviNgUPMOvUotkFHp6o_C-1Aa_fG1RYxf6nyQAP5GvCuSr0pNcCyWPO14ILg_ogGWEfBvPdOF6wcMA9JKmNpHLJ15oUiPG7C8jNkQGn3WiT_FFau4PsBlDBhS_SwTrIeuWHp82NNVzwMeh2hrPTcI7Y5eT_Q29rgPcJ0D9BVz6zzWtqh8nRtunoYO0TKdTa1xCMyuT39ZxZ0cQrUsgvNTmpNiG91jDioe6lQOHC9IsNBOXj2AtaldFznb-runljEkPVQoTybxm7TrdtGFF2Ui8dUzVD7e0rqW6BJMlvyKl3E0-u3nPsIizvhO0pdXszR8vIxrsQNjhxngcEr-0n7uZnWWHITQzbQsUOc2QiTOg5vUFWqDDfTfkDyR7BYdDlznQIHksaX2fIBHdd4AINRIJZmM7App_X8v2i_o666L2S-ocDBHGpaKVkSCp13StZZGv9a0n7PTuAqvZGWouU-CE_4m9EUS5tn6tlZ6JcPDj0XfCGv_GNNwxpw-oNFygpKiYcAQK24SO2hLjWA2zUalXOTCxG7sS34umRbZ-LPXav2fy0zi1dvxu0VhO1atJCSjqJvp-o_N9FfKf5HbJDLWDtSKGpdDqxNee72hktbqif4wzCuc0_QlQ2gjhcim6a5r1AaMPMihZ9ARu-JqWyfKlVA6xq5c0UjICBDQLMmGOnej3n4nrtsC55iPFpmEyEjLlbWotahd27v7F7RxT__Ta1jaKfPzVabngnf1MJfHMiRCyEP-j_dZq6LPyBIQUNTSAv3BYS-dxe_b5WXTh1MExXc5F5UxLfDYRcciSIl2clOlotsp829e1vQGRlCRZ3SdDkJ7w.QDGK5duescw-IkKFVIX7TQ",
  "id_token": "eyJraWQiOiJkUW05NGZyalZhbTh2eFBNZHcwZzVMTm5NenczQmg2aG5WVWtpSGpaOXZvPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI1MWEzNmQ0YS0xMDgxLTcwNWQtM2VjNC1lMjIyYTgyZjliZjgiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiY3VzdG9tOm9yZ05hbWUiOiJibHVla2FrdHVzLmNvbSIsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1zb3V0aC0xLmFtYXpvbmF3cy5jb21cL2FwLXNvdXRoLTFfcTFTbWJjb1dwIiwiY29nbml0bzp1c2VybmFtZSI6IjUxYTM2ZDRhLTEwODEtNzA1ZC0zZWM0LWUyMjJhODJmOWJmOCIsImdpdmVuX25hbWUiOiJTdXJhaiIsIm9yaWdpbl9qdGkiOiIzNTMzYmY2MC1iMTNmLTQyYTYtOGJkZC1hOTNmYzU1MTQxNjUiLCJhdWQiOiIzbWRpYjVsaDQ2cnNtMjdka210aW9oczlnaiIsImV2ZW50X2lkIjoiY2EzMzhjM2EtZDIwNS00ZTc0LWE0MzItYTlhZDk1ZmJlNWRjIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3NjE4MDA1NDMsImV4cCI6MTc2MTg4Njk0MywiaWF0IjoxNzYxODAwNTQzLCJmYW1pbHlfbmFtZSI6Ik5hcmF5YW4iLCJqdGkiOiJhZGU4YzNlOC1jNzkyLTRkZWQtOWViNS0xZDU4M2IzY2M1NzIiLCJlbWFpbCI6InN1cmFqLm5hcmF5YW5AYmx1ZWtha3R1cy5jb20ifQ.Xa915BVlZedWFo52inobvfkYuoozYbJMeLZY9o3yL_xbzJlkwuGF3PWIuw0gJH5xFiBvV8rsyoOgrPChE0FT4khZ6xCCAib-wkmesA7AzdDKTrOfdsktJ5ceAXTcKv2Q5GHlTBjo7_wPxH7aSabI_NoL6jnhExtn7y8GX5t85JTKQKZn1dd9S6jiBn5dyDCUkD16kthV8eMgFi1b7vteWYjmISM87BzWr2txf9jzaif0xF4XwIM879ZWFNk9M0aIj4RI-Rg-1bn6nsiJI5CpCQXavmBOw0IlPmVEQZCdvJvsvtpNTMOyZCfe3OdfeyR8Xwr5CDMBR2Lg0oiIXPbo8Q",

  // If you still want to send all as a single Cookie header as well (may be required by backend):
  // "cookie": 'email="suraj.narayan@bluekaktus.com"; org_name=bluekaktus.com; access_token=...; refresh_token=...; id_token=...'
};

// const bkUrl = 'https://apisapphire.bluekaktus.com/api/chat/client/agent';
const bkUrl = 'http://localhost:8001/api/chat/client/agent';

const apiCall = async (prompt: string) => {

  const bkReqBody = {
    id: crypto.randomUUID(),
    messages: [
      { role: "user", content: prompt }
    ],
    model: "Best Model"
  };

  const res = await fetch(bkUrl, {
    method: "POST",
    headers: bkHeaders,
    body: JSON.stringify(bkReqBody)
  });
  const data = await res.json();
  console.log("BK output:", data);
  return data
  // Example expected structure of data:
  // {
  //   output: "...",
  //   table_data: [...],
  //   chart_data: [...]
  // }
}
export const makeCompletionApiCall = async ({
  searchQuery,
  previousC1Response,
  setC1Response,
  setIsLoading,
  abortController,
  setAbortController,
  onResponseComplete,
}: ApiCallParams) => {
  try {
    if (abortController) {
      abortController.abort();
    }

    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    setIsLoading(true);

    const data: Object = await apiCall(searchQuery);
    const user_prompt = `
    user_query: ${searchQuery}
    output by analysis in  json format: ${JSON.stringify(data)}
    `

    // Call the API route which will handle the BK API call server-side
    const response = await fetch("/api/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: user_prompt,
        previousC1Response,
      }),
      signal: newAbortController.signal,
    });

    const decoder = new TextDecoder();
    const stream = response.body?.getReader();
    if (!stream) {
      throw new Error("response.body not found");
    }

    let streamResponse = "";
    while (true) {
      const { done, value } = await stream.read();
      const chunk = decoder.decode(value, { stream: !done });
      streamResponse += chunk;
      setC1Response(streamResponse);
      if (done) break;
    }

    if (onResponseComplete && streamResponse.trim()) {
      onResponseComplete(searchQuery, streamResponse);
    }
  } catch (error) {
    console.error("Error in makeCompletionApiCall:", error);
  } finally {
    setIsLoading(false);
    setAbortController(null);
  }
};