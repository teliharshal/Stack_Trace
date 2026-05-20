import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const AttemptTest = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [resultLink, setResultLink] = useState("");
  const [score, setScore] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const auth = {
    auth: {
      username: user.email,
      password: user.password
    }
  };

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/employee/assignment/${assignmentId}`, auth)
      .then((res) => setAssignment(res.data))
      .catch(console.error);
  }, [assignmentId]);

  const submitResult = async () => {
    if (!resultLink) return alert("Result link required");

    try {
      await axios.put(
        `http://localhost:8080/api/employee/submit-test/${assignmentId}`,
        { resultLink, score },
        auth
      );

      alert("Submitted Successfully");
      navigate("/MySkills");

    } catch (err) {
      console.error(err);
      alert("Failed");
    }
  };

  if (!assignment) return <div>Loading...</div>;

  return (
    <div className="p-6">

      <h2 className="text-xl font-bold mb-4">
        Attempt Test - {assignment.skillName}
      </h2>

      {/* Start Test */}
      <a
        href={assignment.testLink}
        target="_blank"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Start Test
      </a>

      {/* Submit */}
      <div className="mt-6">
        <input
          type="text"
          placeholder="Paste Result Link"
          value={resultLink}
          onChange={(e) => setResultLink(e.target.value)}
          className="border p-2 w-full mb-2"
        />

        <input
          type="number"
          placeholder="Score"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="border p-2 w-full mb-2"
        />

        <button
          onClick={submitResult}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Submit Result
        </button>
      </div>

    </div>
  );
};

export default AttemptTest;
