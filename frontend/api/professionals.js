// Vercel Serverless Function: GET /api/professionals
import { matchFallbackProfessionals, FALLBACK_PROFESSIONALS } from '../src/services/mockData.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  if (id) {
    const pro = FALLBACK_PROFESSIONALS.find((p) => p.id === id) || FALLBACK_PROFESSIONALS[0];
    return res.status(200).json({
      success: true,
      data: pro,
    });
  }

  const result = matchFallbackProfessionals(req.query || {});
  return res.status(200).json({
    success: true,
    data: result,
  });
}
