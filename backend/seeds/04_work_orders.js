/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  const groups = await knex('specification_groups').select('id', 'name');
  const group = Object.fromEntries(groups.map(g => [g.name, g.id]));
  const vessels = await knex('vessels').select('id', 'name');
  const vessel = Object.fromEntries(vessels.map(v => [v.name, v.id]));

  await knex('work_orders').insert([
    { job_code: 'C001', job_name: '3 month routine check and inspection El.Motor', job_type: 'PMS Job', job_category: 'Check', estimated_hours: 40, responsible_rank: 'Chief Officer', budget: 34234234, internal_estimate: 50000, vessel_id: vessel['Ocean Star'], spec_group_id: group['General'], critical_job: true, internal_job: true, machinery_group: '2022-11-02 10:50:00', description: 'NOTE-: REFER ATTACHED DOCUMENT FOR DETAILED MAINTENANCE JOB DESCRIPTION. CHECK THAT ALL VALVES HAVE FREEDOM OF MOVEMENT AND ARE IN THE CORRECT POSITION.' },
    { job_code: 'C001', job_name: '6 Months Routine Check and Operate The Electro Hydraulic Controls', job_type: 'Dock Job', job_category: 'Operate', estimated_hours: 24, responsible_rank: '2/E', budget: 8000, internal_estimate: 9500, vessel_id: vessel['Ocean Star'], spec_group_id: group['General'] },
    { job_code: 'C001', job_name: 'Grease of Main AC FW Cooling Pump', job_type: 'Dock Job', job_category: 'Greasing', estimated_hours: 8, responsible_rank: '3/E', budget: 1200, internal_estimate: 1500, vessel_id: vessel['Ocean Star'], spec_group_id: group['General'] },
    { job_code: 'C002', job_name: '3 Month Routine Check and Inspection El. Motor', job_type: 'PMS Job', job_category: 'Check', estimated_hours: 20, responsible_rank: 'Chief Officer', budget: 4500, internal_estimate: 5200, vessel_id: vessel['Ocean Star'], spec_group_id: group['Equipment for Crew'] },
    { job_code: 'C001', job_name: '3 Week Routine Greasing of Tugger Winch Emergency Break', job_type: 'Dock Job', job_category: 'Greasing', estimated_hours: 6, responsible_rank: 'Bosun', budget: 700, internal_estimate: 850, vessel_id: vessel['Ocean Star'], spec_group_id: group['Equipment for Crew'] },
    { job_code: 'C001', job_name: '2 Months Routine for Greasing of Anchor Windlass/Towing Winch', job_type: 'Dock Job', job_category: 'Greasing', estimated_hours: 10, responsible_rank: 'Bosun', budget: 900, internal_estimate: 1100, vessel_id: vessel['Ocean Star'], spec_group_id: group['Equipment for Crew'] },
    { job_code: 'C001', job_name: '3 Weeks Greasing Rope Reel', job_type: 'Dock Job', job_category: 'Greasing', estimated_hours: 4, responsible_rank: 'AB', budget: 300, internal_estimate: 400, vessel_id: vessel['Ocean Star'], spec_group_id: group['Equipment for Crew'] },
    { job_code: 'H001', job_name: '3 Month Routine Check and Inspection El. Motor', job_type: 'UPM Job', job_category: 'Check', estimated_hours: 16, responsible_rank: 'C/E', budget: 5600, internal_estimate: 6100, vessel_id: vessel['MV Glory'], spec_group_id: group['Hull'] },
    { job_code: 'H002', job_name: 'Decking Eng Buster fuel', job_type: 'Dock Job', job_category: 'Repair', estimated_hours: 30, responsible_rank: '2/E', budget: 12500, internal_estimate: 14000, vessel_id: vessel['MV Glory'], spec_group_id: group['Hull'] },
    { job_code: 'C001', job_name: 'Aux. Cooling Sw Pump El. Motor 3 Month Routine Check and Inspection', job_type: 'Dock Job', job_category: 'Check', estimated_hours: 18, responsible_rank: '3/E', budget: 3800, internal_estimate: 4300, vessel_id: vessel['MV Glory'], spec_group_id: group['Machiney Main Components'] },
    { job_code: 'C001', job_name: '3 Month Routine Check and Inspection El. Motor', job_type: 'PMS Job', job_category: 'Check', estimated_hours: 22, responsible_rank: '2/E', budget: 5200, internal_estimate: 5900, vessel_id: vessel['MV Glory'], spec_group_id: group['Machiney Main Components'] },
    { job_code: 'A3', job_name: 'Grease of Main AC FW Cooling Pump', job_type: 'Dock Job', job_category: 'Greasing', estimated_hours: 8, responsible_rank: '3/E', budget: 1400, internal_estimate: 1600, vessel_id: vessel['MV Glory'], spec_group_id: group['Ship Common Systems'] },
    { job_code: 'A4', job_name: '5 Monthly check of Auxiliary engine', job_type: 'PMS Job', job_category: 'Check', estimated_hours: 36, responsible_rank: '2/E', budget: 9800, internal_estimate: 11000, vessel_id: vessel['Ocean Star'], spec_group_id: group['Ship Common Systems and Devices'] },
    { job_code: 'A5', job_name: 'Sub Job 5', job_type: 'Dock Job', job_category: 'Repair', estimated_hours: 12, responsible_rank: '3/E', budget: 2600, internal_estimate: 3000, vessel_id: vessel['Ocean Star'], spec_group_id: group['Ship Common Systems and Devices'] },
    { job_code: 'T01', job_name: '3 Month Routine Check and Inspection El. Motor', job_type: 'PMS Job', job_category: 'Check', estimated_hours: 20, responsible_rank: '2/E', budget: 5000, internal_estimate: 5500, vessel_id: vessel['MV Glory'], spec_group_id: group['Test Chik'] },
  ]);
};
