export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { phone, amount } = req.body;
  
  const consumerKey = process.env.MPESA_KEY;
  const consumerSecret = process.env.MPESA_SECRET;
  const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
  const shortcode = '123567'; // 
  
  const auth = Buffer.from(consumerKey + ':' + consumerSecret).toString('base64');
  const tokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { 'Authorization': 'Basic ' + auth }
  });
  const tokenData = await tokenRes.json();
  
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');
  
  const stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + tokenData.access_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: 'https://portal-net-wifi.vercel.app/api/callback',
      AccountReference: 'GoldenWifi',
      TransactionDesc: 'WiFi Access'
    })
  });
  
  const stkData = await stkRes.json();
  res.status(200).json(stkData);
    }
