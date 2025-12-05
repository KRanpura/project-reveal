import React from 'react';
import { Wrench } from 'lucide-react';

const AdminPortal = () => {
  return (
    <div className="p-6 md:p-10 text-center">
      <Wrench className="h-16 w-16 mx-auto text-gray-400 mb-4" />
      <h2 className="text-4xl font-bold text-gray-800 mb-3">Admin Portal</h2>
      <p className="text-xl text-gray-600">
        The administrative backend is **In Progress**.
      </p>
      <p className="text-lg text-gray-500 mt-2">
        This is where you will manage and approve student-submitted data from S3/PostgreSQL.
      </p>
    </div>
  );
};

export default AdminPortal;