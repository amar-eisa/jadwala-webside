import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadNotification {
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  jobTitle: string;
  studentCount: string;
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_WHATSAPP_NUMBER_RAW = Deno.env.get('TWILIO_WHATSAPP_NUMBER');
    
    // Ensure WhatsApp numbers have the correct prefix
    const TWILIO_WHATSAPP_NUMBER = TWILIO_WHATSAPP_NUMBER_RAW?.startsWith('whatsapp:') 
      ? TWILIO_WHATSAPP_NUMBER_RAW 
      : `whatsapp:${TWILIO_WHATSAPP_NUMBER_RAW}`;
    const RECIPIENT_NUMBER = 'whatsapp:+96599679479';

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      console.error('Missing Twilio credentials');
      return new Response(
        JSON.stringify({ error: 'Missing Twilio credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lead: LeadNotification = await req.json();
    console.log('Received lead notification request:', lead.fullName);

    // Format the WhatsApp message
    const message = `🔔 *طلب استفسار جديد!*

👤 *الاسم:* ${lead.fullName}
📧 *البريد:* ${lead.email}
📱 *الهاتف:* ${lead.phone}
🏛️ *المؤسسة:* ${lead.institution}
💼 *المسمى:* ${lead.jobTitle}
👥 *عدد الطلاب:* ${lead.studentCount}
${lead.notes ? `📝 *ملاحظات:* ${lead.notes}` : ''}

⏰ ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Kuwait' })}`;

    // Send WhatsApp message via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('From', TWILIO_WHATSAPP_NUMBER);
    formData.append('To', RECIPIENT_NUMBER);
    formData.append('Body', message);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const twilioResult = await twilioResponse.json();
    console.log('Twilio response:', twilioResult);

    if (!twilioResponse.ok) {
      console.error('Twilio error:', twilioResult);
      return new Response(
        JSON.stringify({ error: 'Failed to send WhatsApp message', details: twilioResult }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: twilioResult.sid }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
