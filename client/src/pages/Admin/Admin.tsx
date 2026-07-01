import { useMemo, useState } from "react";
import Button from "../../common/Button/Button";
import "../../styles/page.css";

const initialCandidates = [
  { id: 1, name: "Ava Chen", party: "Forward Party", votes: 42 },
  { id: 2, name: "Marcus Lee", party: "People's Alliance", votes: 31 },
  { id: 3, name: "Sofia Alvarez", party: "Unity Coalition", votes: 27 },
];

const Admin = () => {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [name, setName] = useState("");
  const [party, setParty] = useState("");

  const totalVotes = useMemo(() => candidates.reduce((sum, candidate) => sum + candidate.votes, 0), [candidates]);

  const handleAddCandidate = () => {
    if (!name.trim() || !party.trim()) {
      return;
    }

    setCandidates((current) => [
      ...current,
      { id: Date.now(), name: name.trim(), party: party.trim(), votes: 0 },
    ]);
    setName("");
    setParty("");
  };

  return (
    <div className="page">
      <div className="card">
        <span className="badge">Admin panel</span>
        <h1>Election administration</h1>
        <p>Manage candidates and monitor current totals from a single dashboard.</p>

        <div className="grid two" style={{ marginTop: "24px" }}>
          <div className="card" style={{ padding: "20px" }}>
            <h2>Add candidate</h2>
            <div className="grid" style={{ marginTop: "12px" }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Candidate name" />
              <input value={party} onChange={(e) => setParty(e.target.value)} placeholder="Party" />
            </div>
            <div style={{ marginTop: "12px" }}>
              <Button text="Add candidate" onClick={handleAddCandidate} />
            </div>
          </div>

          <div className="card" style={{ padding: "20px" }}>
            <h2>Overview</h2>
            <p style={{ marginTop: "8px" }}>Total ballots: {totalVotes}</p>
            <p>Active candidates: {candidates.length}</p>
          </div>
        </div>

        <div className="card" style={{ marginTop: "20px" }}>
          <h2>Current candidates</h2>
          <div className="grid" style={{ marginTop: "12px" }}>
            {candidates.map((candidate) => (
              <div key={candidate.id} className="card" style={{ padding: "16px" }}>
                <strong>{candidate.name}</strong>
                <p>{candidate.party}</p>
                <p style={{ marginTop: "6px" }}>Votes: {candidate.votes}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
