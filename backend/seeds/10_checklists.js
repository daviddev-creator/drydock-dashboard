exports.seed = async function seed(knex) {
  const hasActive = await knex.schema.hasColumn('checklists', 'active');
  const baseChecklists = [
    { name: 'Audit Checklist', description: 'Audit the kitchen equipment and storage and units', active: true },
    { name: 'Cleaning', description: 'Cleanliness Checklist', active: false },
    { name: 'Safety', description: 'Standard Safety checks', active: true },
    { name: 'Hot Work', description: 'Hot work permits', active: false },
    { name: 'Daily Checklist', description: 'Daily checklists', active: true },
    { name: 'Test Checklist', description: 'General Checklist', active: false },
    { name: 'Test Checklist2', description: 'Test Checklist', active: false },
  ];

  await knex('checklists').insert(
    baseChecklists.map((c) => (hasActive ? c : { name: c.name, description: c.description }))
  );

  const audit = await knex('checklists').where('name', 'Audit Checklist').first();
  const daily = await knex('checklists').where('name', 'Daily Checklist').first();
  const auditId = audit.id;
  const dailyId = daily.id;

  await knex('checklist_items').insert([
    { checklist_id: auditId, title: 'Status', data_type: 'single_choice', options: JSON.stringify(['Complete', 'Incomplete', 'N/A']), sort_order: 1 },
    { checklist_id: auditId, title: 'How many Defects were found', data_type: 'number', sort_order: 2 },
    { checklist_id: auditId, title: 'Describe the condition of the ballast tank.', data_type: 'text', sort_order: 3 },
    { checklist_id: auditId, title: 'What is the meter Reading for Auxilliary Engine?', data_type: 'meter_reading', sort_order: 4 },
    { checklist_id: auditId, title: 'Which of the following items were consumed?', data_type: 'multiple_choice', options: JSON.stringify(['Oil', 'Grease', 'Filter', 'Spare Parts']), sort_order: 5 },
    { checklist_id: auditId, title: 'Were the security cameras checked', data_type: 'inspection', sort_order: 6 },
    { checklist_id: auditId, title: 'Were the locks inspected', data_type: 'inspection', sort_order: 7 },
    { checklist_id: dailyId, title: 'Engine room cleanliness', data_type: 'inspection', sort_order: 1 },
    { checklist_id: dailyId, title: 'Bilge level reading', data_type: 'meter_reading', sort_order: 2 },
  ]);
};