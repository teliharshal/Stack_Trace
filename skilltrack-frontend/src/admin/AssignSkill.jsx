import { useEffect, useState } from "react";
import axios from "axios";

const AssignSkill = () => {
  const [employees, setEmployees] = useState([]);
  const [skills, setSkills] = useState([]);

  const [employeeId, setEmployeeId] = useState("");
  const [skillId, setSkillId] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    fetchEmployees();
    fetchSkills();
  }, []);

  const fetchEmployees = async () => {
    const res = await axios.get("http://localhost:8080/api/admin/employees");
    setEmployees(res.data);
  };

  const fetchSkills = async () => {
    const res = await axios.get("http://localhost:8080/api/admin/skill-catalog");
    setSkills(res.data);
  };

  const handleAssign = async () => {
    try {
      await axios.post("http://localhost:8080/api/admin/assign-skills", null, {
        params: {
          employeeId,
          skillId,
          deadline,
        },
      });

      alert("✅ Skill Assigned Successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Error assigning skill");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Assign Skill</h2>

      {/* Employee Dropdown */}
      <select
        className="border p-2 mb-3 w-full"
        onChange={(e) => setEmployeeId(e.target.value)}
      >
        <option>Select Employee</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.name}
          </option>
        ))}
      </select>

      {/* Skill Dropdown */}
      <select
        className="border p-2 mb-3 w-full"
        onChange={(e) => setSkillId(e.target.value)}
      >
        <option>Select Skill</option>
        {skills.map((skill) => (
          <option key={skill.id} value={skill.id}>
            {skill.skillName}
          </option>
        ))}
      </select>

      {/* Deadline */}
      <input
        type="datetime-local"
        className="border p-2 mb-3 w-full"
        onChange={(e) => setDeadline(e.target.value)}
      />

      <button
        onClick={handleAssign}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Assign Skill
      </button>
    </div>
  );
};

export default AssignSkill;
