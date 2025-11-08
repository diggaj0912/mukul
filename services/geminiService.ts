import { GoogleGenAI, Type } from "@google/genai";
import { CareVisionReport } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const reportSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A brief, one-sentence summary of the patient's current state.",
    },
    emotion: {
      type: Type.STRING,
      description: "Detected emotion. Must be one of: 'Calm', 'Happy', 'Sadness', 'Fear', 'Pain', 'Distress', 'Neutral'.",
    },
    motion: {
      type: Type.STRING,
      description: "Detected motion or state. Must be one of: 'Normal Activity', 'Lying Still (Resting)', 'Sudden Movement (Potential Fall)', 'No Person Detected'.",
    },
    alertStatus: {
      type: Type.STRING,
      description: "Set to 'Alert Triggered' if distress, pain, fear, or a potential fall is detected. Otherwise, 'No Alert'.",
    },
    recommendation: {
      type: Type.STRING,
      description: "A clear, actionable recommendation for the caretaker. E.g., 'Patient appears calm.' or 'Check on the patient immediately.'",
    },
  },
  required: ["summary", "emotion", "motion", "alertStatus", "recommendation"],
};

export const generateCareVisionReport = async (
  base64Image: string,
  mimeType: string
): Promise<CareVisionReport> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `You are CareVision, an AI health monitoring assistant for the elderly and hospital patients. Your primary goal is patient safety and well-being.
            Analyze the following image from a patient's room.
            1.  **Assess Emotion:** Identify facial expressions for signs of distress, pain, fear, or sadness.
            2.  **Analyze Motion:** Observe body posture for sudden movements (indicating a fall) or prolonged stillness.
            3.  **Determine Alert Status:** If any sign of significant distress (Pain, Fear, Distress, Potential Fall) is detected, set 'alertStatus' to 'Alert Triggered'. Otherwise, it must be 'No Alert'.
            4.  **Provide a Recommendation:** Give a concise, actionable recommendation for a caretaker.
            Your response must be factual, concise, and strictly follow the provided JSON schema.`,
          },
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: reportSchema,
      },
    });

    const jsonText = response.text.trim();
    const reportData = JSON.parse(jsonText);

    if (
      !reportData.summary ||
      !reportData.emotion ||
      !reportData.alertStatus ||
      !reportData.recommendation
    ) {
      throw new Error('Invalid report structure received from API.');
    }
    
    return reportData as CareVisionReport;

  } catch (error) {
    console.error("Error generating CareVision report:", error);
    throw new Error("Failed to generate report from Gemini API.");
  }
};