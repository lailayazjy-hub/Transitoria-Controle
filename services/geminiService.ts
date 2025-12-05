import { GoogleGenAI } from "@google/genai";
import { Transaction, TransitoriaCategory } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeTransactionsWithGemini = async (transactions: Transaction[]): Promise<{
    analyses: Record<string, { analysis: string, risk: string, period: string, category: string }>,
    completenessIssues: Array<{ description: string, expectedPeriod: string, confidence: number }>
}> => {
  if (!ai) {
    console.warn("No API Key found for Gemini");
    return { analyses: {}, completenessIssues: [] };
  }

  // Optimize token usage by sending essential fields
  const simplifiedTrans = transactions.map(t => `${t.id}|${t.date}|${t.description}|${t.amount}|${t.relation}`);
  
  const prompt = `
    Je bent een expert in audit en transitoria (overlopende activa/passiva). 
    Analyseer de volgende boekhoudkundige transacties.

    Transacties (ID|Datum|Omschrijving|Bedrag|Relatie):
    ${simplifiedTrans.join('\n')}

    TAAK 1: Analyseer per transactie:
    - Wat is de juiste toerekeningsperiode (allocatedPeriod)? (Format: YYYY-MM, YYYY-Qx, of YYYY-YEAR)
    - Categorie (category): 'Vooruitbetaalde kosten', 'Nog te ontvangen/betalen', 'Regulier', of 'Correctie'.
    - Risico (risk): HIGH als datum en periode niet matchen zonder logische reden (bijv. vooruitbetaling is logisch, maar oude factuur in nieuw jaar niet altijd).
    - Korte analyse (analysis): max 10 woorden.

    TAAK 2: Completeness Check (Volledigheid):
    - Identificeer terugkerende kosten (bijv. huur, schoonmaak, lease) die lijken te ontbreken in de reeks.
    - Geef suggesties voor wat er mist.

    Geef antwoord als JSON object met twee keys: "transactions" (lijst) en "completeness" (lijst).
    
    Voorbeeld JSON Structuur:
    {
      "transactions": [
        { "id": "1", "analysis": "Huur Q1 correct vooruitbetaald", "risk": "LOW", "period": "2024-Q1", "category": "Vooruitbetaalde kosten" }
      ],
      "completeness": [
        { "description": "Schoonmaakkosten maart ontbreken", "expectedPeriod": "2024-03", "confidence": 0.9 }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return { analyses: {}, completenessIssues: [] };

    const data = JSON.parse(text);
    const analyses: Record<string, any> = {};
    
    if (data.transactions && Array.isArray(data.transactions)) {
        data.transactions.forEach((item: any) => {
            analyses[item.id] = {
                analysis: item.analysis,
                risk: item.risk,
                period: item.period,
                category: item.category
            };
        });
    }

    return {
        analyses,
        completenessIssues: data.completeness || []
    };

  } catch (error) {
    console.error("Gemini analysis failed", error);
    return { analyses: {}, completenessIssues: [] };
  }
};