/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function seed(knex) {
  const shipyards = await knex('shipyards').select('id', 'name');
  const s = Object.fromEntries(shipyards.map((r) => [r.name, r.id]));
  const rfqs = await knex('rfqs').select('id', 'rfq_no');
  const rfq = (no) => rfqs.find((r) => r.rfq_no === no);
  const rfq57 = rfq('SD10/S/RFQ/17/0057');
  const rfq102 = rfq('SD10/S/RFQ/20/0102');
  if (!rfq57 || !rfq102) return;

  await knex('quotations').insert([
    { rfq_id: rfq57.id, shipyard_id: s['Bombay Dockyard'], quotation_no: 'SEPT2020/DD1', status: 'Received', total: 285000, quote_date: '2020-09-01 10:00:00', selected: true },
    { rfq_id: rfq57.id, shipyard_id: s['Hindustan Shipyard Limited'], quotation_no: 'OCT2020DD2', status: 'Received', total: 292000, quote_date: '2020-09-02 10:00:00' },
    { rfq_id: rfq57.id, shipyard_id: s['Timblo Drydocks Private Limited'], quotation_no: 'OCT2020DD2', status: 'Sent, Awaiting Quotation', total: 0, sent_at: '2020-08-25 09:00:00' },
    { rfq_id: rfq57.id, shipyard_id: s['Kempell'], quotation_no: null, status: 'Not Sent', total: 0 },
    { rfq_id: rfq102.id, shipyard_id: s['Bombay Dockyard'], quotation_no: null, status: 'Sent, Awaiting Quotation', total: 0, sent_at: '2020-08-22 09:00:00' },
    { rfq_id: rfq102.id, shipyard_id: s['Hindustan Shipyard Limited'], quotation_no: 'HS/OCT/0212', status: 'In Quotation (Quotation No.)', total: 0, sent_at: '2017-10-18 15:00:00' },
  ]);
};
