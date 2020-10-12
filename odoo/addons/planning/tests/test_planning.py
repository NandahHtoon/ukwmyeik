from datetime import datetime, date
from odoo.addons.planning.tests.common import TestCommonPlanning

class TestPlanning(TestCommonPlanning):

    @classmethod
    def setUpClass(cls):
        super(TestPlanning, cls).setUpClass()
        cls.setUpEmployees()
        cls.slot_6_2 = cls.env['planning.slot'].create({
            'employee_id': cls.employee_bert.id,
            'start_datetime': datetime(2019, 6, 2, 8, 0),
            'end_datetime': datetime(2019, 6, 2, 17, 0),
        })
        cls.slot_6_3 = cls.env['planning.slot'].create({
            'employee_id': cls.employee_bert.id,
            'start_datetime': datetime(2019, 6, 3, 8, 0),
            'end_datetime': datetime(2019, 6, 3, 17, 0),
        })


    def test_compute_overlap_count(self):
        self.env['planning.slot'].create({
            'employee_id': self.employee_bert.id,
            'start_datetime': datetime(2019, 6, 2, 10, 0),
            'end_datetime': datetime(2019, 6, 2, 12, 0),
        })
        self.env['planning.slot'].create({
            'employee_id': self.employee_bert.id,
            'start_datetime': datetime(2019, 6, 2, 16, 0),
            'end_datetime': datetime(2019, 6, 2, 18, 0),
        })
        self.env['planning.slot'].create({
            'employee_id': self.employee_bert.id,
            'start_datetime': datetime(2019, 6, 2, 18, 0),
            'end_datetime': datetime(2019, 6, 2, 20, 0),
        })
        self.assertEqual(2, self.slot_6_2.overlap_slot_count, '2 slots overlap')
        self.assertEqual(0, self.slot_6_3.overlap_slot_count, 'no slot overlap')