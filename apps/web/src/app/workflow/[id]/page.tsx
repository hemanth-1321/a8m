"use client";

import { useParams } from "next/navigation";

const page = () => {
  const { id } = useParams();

  return <div>Workflow Detail for ID: {id}</div>;
};

export default page;
