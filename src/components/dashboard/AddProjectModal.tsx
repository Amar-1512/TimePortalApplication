import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTimesheet } from '../../hooks/useTimesheet';
import { TimeEntry } from '../../types';
import { availableProjects } from '../../data/mockData';

interface AddProjectModalProps {
  onClose: () => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ onClose }) => {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [customProject, setCustomProject] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const { addTimeEntry } = useTimesheet();

  const handleAddProject = () => {
    const projectName = isCustom ? customProject : selectedProject;
    
    if (!projectName.trim()) {
      alert('Please select or enter a project name.');
      return;
    }
    
    const newEntry: TimeEntry = {
      type: 'project',
      name: projectName,
      mon: 0,
      tue: 0,
      wed: 0,
      thu: 0,
      fri: 0,
      sat:0,
      sun:0
    };
    
    addTimeEntry(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Add Project</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4">
            <div className="flex items-center">
              <input
                id="existing-project"
                type="radio"
                checked={!isCustom}
                onChange={() => setIsCustom(false)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="existing-project" className="ml-2 block text-sm font-medium text-gray-700">
                Select from existing projects
              </label>
            </div>
            
            {!isCustom && (
              <div className="mt-2">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select a project</option>
                  {availableProjects.map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-center">
              <input
                id="custom-project"
                type="radio"
                checked={isCustom}
                onChange={() => setIsCustom(true)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="custom-project" className="ml-2 block text-sm font-medium text-gray-700">
                Enter custom project name
              </label>
            </div>
            
            {isCustom && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customProject}
                  onChange={(e) => setCustomProject(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter project name"
                />
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddProject}
            className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            Add Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;