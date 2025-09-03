import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { projectService } from "../services/projects";

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const accept = async () => {
      try {
        const res = await projectService.acceptInvite(token);
        setMessage(res.message || "Invitation accepted successfully");
        setStatus("success");
        setTimeout(() => navigate("/dashboard"), 2000);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Failed to accept invite");
        setStatus("error");
      }
    };
    accept();
  }, [token, navigate]);

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-20 bg-white shadow rounded-lg p-6 text-center">
        {status === "loading" && <p className="text-gray-600">Accepting invitation...</p>}
        {status === "success" && <p className="text-green-600">{message}</p>}
        {status === "error" && <p className="text-red-600">{message}</p>}
      </div>
    </Layout>
  );
};

export default AcceptInvite;
