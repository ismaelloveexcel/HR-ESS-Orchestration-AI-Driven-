import { Router, Request, Response } from 'express';

const router = Router();

// Mock employee database (replace with actual database)
const employees = new Map([
  ['EMP001', { 
    id: 'EMP001', 
    name: 'Ahmed Al-Mansoori', 
    email: 'ahmed@company.ae',
    position: 'Software Engineer',
    department: 'IT',
    joinDate: '2023-01-15'
  }],
  ['EMP002', { 
    id: 'EMP002', 
    name: 'Fatima Al-Hashimi', 
    email: 'fatima@company.ae',
    position: 'HR Manager',
    department: 'Human Resources',
    joinDate: '2022-06-01'
  }]
]);

// Get all employees
router.get('/', (req: Request, res: Response) => {
  const employeeList = Array.from(employees.values());
  res.json({ 
    count: employeeList.length,
    employees: employeeList 
  });
});

// Get employee by ID
router.get('/:id', (req: Request, res: Response) => {
  const employee = employees.get(req.params.id);
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  res.json(employee);
});

// Create employee
router.post('/', (req: Request, res: Response) => {
  const { id, name, email, position, department, joinDate } = req.body;
  
  if (!id || !name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (employees.has(id)) {
    return res.status(409).json({ error: 'Employee ID already exists' });
  }

  const newEmployee = { id, name, email, position, department, joinDate };
  employees.set(id, newEmployee);
  
  res.status(201).json(newEmployee);
});

// Update employee
router.put('/:id', (req: Request, res: Response) => {
  const employee = employees.get(req.params.id);
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const updated = { ...employee, ...req.body, id: req.params.id };
  employees.set(req.params.id, updated);
  
  res.json(updated);
});

// Delete employee
router.delete('/:id', (req: Request, res: Response) => {
  if (!employees.has(req.params.id)) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  employees.delete(req.params.id);
  res.status(204).send();
});

export default router;
