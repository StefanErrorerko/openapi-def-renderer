import React from 'react';
import { OpenAPIDocument } from '../types/types';

interface InformationProps {
  spec: OpenAPIDocument;
}

const Information: React.FC<InformationProps> = ({ spec }) => {
  const { info, servers } = spec;

  const InfoBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="content-block">
      <h3 className="block-title">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="main-path-content">
      {/* API Info Section */}
      <InfoBlock title="API Information">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{info.title}</h1>
            <div className="text-sm text-gray-500">Version: {info.version}</div>
          </div>

          {info.description && (
            <div className="text-gray-700 whitespace-pre-line">
              {info.description}
            </div>
          )}

          {info.contact && (
            <div className="space-y-1">
              <div className="font-medium text-gray-700">Contact</div>
              {info.contact.email && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Email:</span>
                  <a href={`mailto:${info.contact.email}`} className="text-blue-600 hover:underline">
                    {info.contact.email}
                  </a>
                </div>
              )}
              {info.contact.url && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">URL:</span>
                  <a href={info.contact.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {info.contact.url}
                  </a>
                </div>
              )}
            </div>
          )}

          {info.license && (
            <div className="space-y-1">
              <div className="font-medium text-gray-700">License</div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Name:</span>
                {info.license.url ? (
                  <a href={info.license.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {info.license.name}
                  </a>
                ) : (
                  <span>{info.license.name}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </InfoBlock>

      {/* Servers Section */}
      {servers && servers.length > 0 && (
        <InfoBlock title="API Servers">
          <div className="space-y-4">
            {servers.map((server, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="font-mono text-sm break-all text-gray-800">
                  {server.url}
                </div>
              </div>
            ))}
          </div>
        </InfoBlock>
      )}
    </div>
  );
};

export default Information;