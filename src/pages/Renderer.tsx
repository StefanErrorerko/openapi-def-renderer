import React, { useState } from 'react';
import { OpenAPIDocument, Operation } from '../types/types';
import Path from './Path';
import Information from './Information';
import RefResolver from '../services/RefResolver';
import '../index.css';

interface RendererProps {
  spec: OpenAPIDocument;
}

interface PathMethod {
  path: string;
  method: string;
  operation: Operation;
}

const Renderer: React.FC<RendererProps> = ({ spec }) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<PathMethod | null>(null);

  const handleTabClick = (tab: string) => {
    if (activeTab === tab) {
      setActiveTab(null);
      if (tab === 'paths') {
        setSelectedPath(null);
      }
    } else {
      setActiveTab(tab);
    }
  };

  const handlePathMethodClick = (path: string, method: string, operation: Operation) => {
    setSelectedPath({ path, method, operation });
  };

  const getAllPathMethods = () => {
    const methods: PathMethod[] = [];
    Object.entries(spec.paths).forEach(([path, pathItem]) => {
      Object.entries(pathItem).forEach(([method, operation]) => {
        if (['get', 'post', 'put', 'delete'].includes(method.toLowerCase())) {
          methods.push({
            path,
            method: method.toLowerCase(),
            operation: operation as Operation
          });
        }
      });
    });
    return methods.sort((a, b) => a.path.localeCompare(b.path));
  };

  const renderMainContent = () => {
    if (selectedPath) {
      return (
        <Path
          path={selectedPath.path}
          method={selectedPath.method}
          operation={selectedPath.operation}
          resolver={new RefResolver(spec)}
        />
      );
    }

    if (activeTab === 'info') {
      return <Information spec={spec} />;
    }

    return null;
  };

  return (
    <div className="layout">
      <div className="sidebar">
        <div
          className={`nav-item ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => handleTabClick('info')}
        >
          Information
        </div>
        <div
          className={`paths-list expanded`}
        >
          {getAllPathMethods().map(({ path, method, operation }) => (
            <div
              key={`${path}-${method}`}
              className={`path-item ${
                selectedPath?.path === path && selectedPath?.method === method ? 'selected' : ''
              }`}
              onClick={() => handlePathMethodClick(path, method, operation)}
            >
              <div className="flex items-center gap-2">
                <span className={`method-badge method-${method}`}>
                  {method}
                </span>
                <span className="path-text">{path}</span>
              </div>
              {operation.summary && (
                <div className="path-summary">{operation.summary}</div>
              )}
            </div>
          ))}
        </div>
        <div
          className={`nav-item ${activeTab === 'components' ? 'active' : ''}`}
          onClick={() => handleTabClick('components')}
        >
          Components
        </div>
      </div>
      <div className="main-content">
        {renderMainContent()}
      </div>
    </div>
  );
};

export default Renderer;