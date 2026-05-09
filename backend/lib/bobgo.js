const axios = require('axios');

const BASE_URL = process.env.BOBGO_BASE_URL || 'https://api.sandbox.bobgo.co.za/v2';
const API_KEY = process.env.BOBGO_API_KEY;
const MOCK = process.env.BOBGO_MOCK === 'true' || !API_KEY;

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
  },
});

function mockRates({ destination }) {
  const base = destination?.city?.toLowerCase().includes('cape') ? 95 : 75;
  return [
    {
      service_code: 'BGO-ECO',
      service_name: 'Bob Go Economy',
      courier: 'The Courier Guy',
      total_price: base,
      currency: 'ZAR',
      min_delivery_date: addDays(3),
      max_delivery_date: addDays(5),
    },
    {
      service_code: 'BGO-STD',
      service_name: 'Bob Go Standard',
      courier: 'Aramex',
      total_price: base + 40,
      currency: 'ZAR',
      min_delivery_date: addDays(2),
      max_delivery_date: addDays(3),
    },
    {
      service_code: 'BGO-OVN',
      service_name: 'Bob Go Overnight',
      courier: 'DSV',
      total_price: base + 110,
      currency: 'ZAR',
      min_delivery_date: addDays(1),
      max_delivery_date: addDays(1),
    },
  ];
}

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

async function getRates({ origin, destination, items }) {
  if (MOCK) return mockRates({ destination });

  const { data } = await client.post('/rates', {
    collection_address: {
      company: origin.company,
      street_address: origin.street,
      city: origin.city,
      code: origin.zip,
      country: origin.country,
    },
    delivery_address: {
      street_address: destination.street || '',
      city: destination.city,
      code: destination.zip,
      country: destination.country,
    },
    parcels: items.map(i => ({
      submitted_length_cm: i.length || 15,
      submitted_width_cm: i.width || 10,
      submitted_height_cm: i.height || 5,
      submitted_weight_kg: i.weight || 0.5,
    })),
    timeout: 10,
  });

  // Flatten provider responses into a simple rates array
  const rates = [];
  for (const provider of data.provider_rate_requests || []) {
    if (provider.status !== 'success') continue;
    for (const resp of provider.responses || []) {
      if (resp.status !== 'success') continue;
      rates.push({
        service_code: `${provider.provider_slug}-${resp.service_level_code}`,
        service_name: `${provider.provider_name} ${resp.service_level?.name || resp.service_level_code}`,
        courier: provider.provider_name,
        total_price: resp.rate_amount,
        currency: 'ZAR',
        description: resp.service_level?.description || '',
      });
    }
  }
  return rates;
}

async function createShipment(payload) {
  if (MOCK) {
    const ref = `BGM${Date.now()}`;
    return {
      id: ref,
      tracking_reference: ref,
      status: 'pending-collection',
      label_url: `https://mock.bobgo.local/labels/${ref}.pdf`,
      courier: payload.service_code || 'BGO-STD',
    };
  }
  const { data } = await client.post('/shipments', payload);
  return data;
}

async function getTracking(trackingRef) {
  if (MOCK) {
    return {
      tracking_reference: trackingRef,
      status: 'in-transit',
      events: [
        { timestamp: new Date().toISOString(), status: 'collected', description: 'Parcel collected from sender' },
        { timestamp: new Date().toISOString(), status: 'in-transit', description: 'In transit to destination hub' },
      ],
    };
  }
  const { data } = await client.get('/tracking', { params: { tracking_reference: trackingRef } });
  return data;
}

module.exports = { getRates, createShipment, getTracking, MOCK };
