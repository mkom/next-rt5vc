import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { number, bodyMessage } = req.body;

  if (!number || !bodyMessage) {
    return res.status(400).json({ message: 'number and bodyMessage are required' });
  }

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_WABOTAPI_URL}notify`,
      { number, bodyMessage },
      { headers: { 'Content-Type': 'application/json' } }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error forwarding notify request:', error?.response?.data || error.message);
    return res.status(500).json({ 
      message: 'Failed to send notification', 
      error: error?.response?.data || error.message 
    });
  }
}
