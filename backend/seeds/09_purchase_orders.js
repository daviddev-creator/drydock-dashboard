/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  const workOrder = await knex('work_orders').where('job_code', 'C001').first();
  if (!workOrder) return;

  await knex('purchase_orders').insert([
    { po_no: 'SD10/O/PO/18/0059C', supplier: 'Mitsubishi Kakoki Kaisha Ltd', total: 2725, category: 'Inventory', work_order_id: workOrder.id },
    { po_no: 'SD10/O/PO/22/0009A', supplier: 'VARA ENERGY', total: 200, category: 'Inventory', work_order_id: workOrder.id },
    { po_no: 'SW10/O/PO/21/0201', supplier: '03Aug', total: 239.76, category: 'Inventory', work_order_id: workOrder.id },
    { po_no: 'SW10/O/PO/21/0200', supplier: '411', total: 540, category: 'Inventory', work_order_id: workOrder.id },
    { po_no: 'SW10/O/PO/21/0195', supplier: '03Aug', total: 729, category: 'Inventory', work_order_id: workOrder.id },
    { po_no: 'SW20/O/PO/21/0036', supplier: 'Aqua Group LLC', total: 5400, category: 'Inventory', work_order_id: workOrder.id },
    { po_no: 'SW20/O/PO/21/0035', supplier: 'Aflex Ships Equipment LLC', total: 1147.5, category: 'Inventory', work_order_id: workOrder.id },
    { po_no: 'SW10/O/PO/21/0202', supplier: '07Jan2020', total: 71.28, category: 'Spare part', work_order_id: workOrder.id },
    { po_no: 'SW10/O/PO/21/0192', supplier: 'Offshore & Maritime Resources FZE', total: 1918.08, category: 'Spare part', work_order_id: workOrder.id },
    { po_no: 'SW24/O/PO/21/0149', supplier: 'VARA ENERGY', total: 440, category: 'Machinery', work_order_id: workOrder.id },
  ]);
};
